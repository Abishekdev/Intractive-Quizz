import { isFirebaseConfigured } from './firebase-config.js?v=2';
import { firebaseConfig } from './firebase-config.js?v=2';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase, onValue, ref, set } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const questions = [
	['What is the defining operation of a transposition cipher?', ['Rearranging the positions of plaintext symbols', 'Replacing every letter with a new symbol', 'Hashing plaintext into a fixed digest', 'Adding a random key to each character']],
	['How does a transposition cipher differ from a substitution cipher?', ['Transposition changes positions; substitution changes symbols', 'Transposition always uses numbers; substitution uses letters', 'Substitution cannot use a key', 'There is no meaningful difference']],
	['In a Rail Fence cipher, plaintext is commonly written...', ['In a zigzag across multiple rails', 'In a square spiral', 'Backwards in one row', 'Using a frequency table']],
	['What controls the column order in a keyed columnar transposition?', ['The alphabetical order of key letters', 'The length of the ciphertext only', 'The first plaintext word', 'A hash digest']],
	['Which property remains unchanged after a pure transposition?', ['The frequency of each plaintext symbol', 'The order of every symbol', 'The plaintext length and symbol counts', 'The key value']],
	['To decrypt a basic transposition cipher, the receiver must know...', ['The rearrangement or permutation used', 'The plaintext in advance', 'A substitution alphabet only', 'The sender’s password hash']],
	['A permutation in cryptography describes...', ['A rearrangement of positions', 'A random prime number', 'A letter frequency score', 'A message authentication tag']],
	['A common limitation of simple transposition ciphers is that they...', ['Preserve letter frequencies and can leak patterns', 'Always produce longer messages', 'Cannot be decrypted with a key', 'Only work on binary files']],
	['Which attack is especially useful against a simple transposition cipher?', ['Trying likely keys and analyzing readable structure', 'Changing the operating system clock', 'Guessing a public certificate', 'Brute-forcing a hash salt only']],
	['In columnar transposition, a message shorter than the grid is often handled by...', ['Padding empty cells or using an agreed irregular rule', 'Deleting the final word', 'Replacing spaces with passwords', 'Converting it to a hash']],
	['What is the purpose of a key in a keyed transposition?', ['To select a repeatable permutation', 'To replace every character', 'To make the message longer', 'To remove all spaces permanently']],
	['Which combination generally provides stronger classical encryption?', ['Transposition combined with substitution', 'Transposition with no key', 'A shorter plaintext', 'Removing the ciphertext']],
	['Why can frequency analysis still help attack transposition ciphers?', ['Symbol frequencies are preserved', 'The cipher reveals the key directly', 'Every symbol becomes unique', 'The ciphertext is always sorted']],
	['A Rail Fence cipher with how many rails is most likely to preserve nearby character relationships?', ['Two rails', 'One hundred rails', 'Zero rails', 'A random number for every letter']],
	['Transposition techniques are historically associated with...', ['Classical military and diplomatic communications', 'Modern GPU rendering only', 'Database indexing only', 'Password hashing standards']]
];

const $ = (id) => document.getElementById(id);
const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const escapeHtml = (value) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[character]);
let status = 'waiting'; let question = 0; let quizEnded = false; let firebaseDatabase = null; let students = {};
if (isFirebaseConfigured) {
	try {
		const firebaseApp = initializeApp(firebaseConfig);
		firebaseDatabase = getDatabase(firebaseApp);
		signInAnonymously(getAuth(firebaseApp)).catch(() => { $('adminConnection').textContent = 'Auth failed'; });
		onValue(ref(firebaseDatabase, 'students'), (snapshot) => {
			students = snapshot.val() || {};
			render();
		});
		onValue(ref(firebaseDatabase, 'quiz'), (snapshot) => { const quiz = snapshot.val() || {}; status = quiz.status || 'waiting'; question = Number(quiz.currentQuestion || 0); render(); });
	} catch { $('adminConnection').textContent = 'Firebase error'; }
}
function sortedStudents() { return Object.values(students).sort((a, b) => b.score - a.score || a.totalTime - b.totalTime); }
function renderQuestion() { const current = questions[Math.max(0, question - 1)]; $('adminQuestionText').textContent = current ? current[0] : 'Waiting for the host to start the quiz.'; $('adminChoices').innerHTML = current ? current[1].map((choice, index) => `<div class="admin-choice"><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(choice)}</div>`).join('') : ''; }
function render() { const roster = sortedStudents(); $('adminStatus').textContent = status; $('adminQuestion').textContent = `${question} / 15`; $('adminOnline').textContent = roster.filter((student) => student.online).length; $('adminAnswers').textContent = roster.reduce((total, student) => total + (student.answeredQuestions || 0), 0); $('adminUpdated').textContent = roster.length ? `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Waiting for activity'; $('adminLeaderboard').innerHTML = `<div class="leader-row head"><span>Rank</span><span>Student</span><span>Score</span><span>Answered</span><span>Time</span></div>${roster.length ? roster.map((student, index) => `<div class="leader-row"><span class="leader-rank">#${index + 1}</span><span>${escapeHtml(student.name)}<small class="muted"> ${escapeHtml(student.rollNo)}</small></span><span class="leader-score">${student.score} pts</span><span>${student.answeredQuestions || 0} / 15</span><span>${formatTime(student.totalTime || 0)}</span></div>`).join('') : '<p class="muted">No students have joined yet.</p>'}`; renderQuestion(); }
$('adminLoginForm').addEventListener('submit', (event) => { event.preventDefault(); if ($('adminPassword').value === 'admin123') { $('adminLogin').classList.add('hidden'); $('adminDashboard').classList.remove('hidden'); render(); } else $('adminLoginError').textContent = 'Incorrect demonstration password.'; });
$('startQuizButton').addEventListener('click', () => { status = 'Live'; question = Math.max(1, question); if (firebaseDatabase) set(ref(firebaseDatabase, 'quiz'), { status, currentQuestion: question }); render(); });
$('pauseQuizButton').addEventListener('click', () => { status = status === 'Paused' ? 'Live' : 'Paused'; if (firebaseDatabase) set(ref(firebaseDatabase, 'quiz/status'), status); render(); });
$('nextQuestionButton').addEventListener('click', () => { if (question < 15) question += 1; if (firebaseDatabase) set(ref(firebaseDatabase, 'quiz/currentQuestion'), question); render(); });
$('endQuizButton').addEventListener('click', () => { quizEnded = true; status = 'Ended'; if (firebaseDatabase) set(ref(firebaseDatabase, 'quiz/status'), status); render(); });
if (isFirebaseConfigured) $('adminConnection').textContent = 'Live Firebase'; else $('adminConnection').textContent = 'Configure Firebase'; render();
