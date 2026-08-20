import { isFirebaseConfigured, firebaseConfig } from './firebase-config.js?v=2';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase, onValue, ref, set } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const defaultQuestions = [
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
].map(([text, options], index) => ({ text, options, answer: 0, difficulty: index === 4 || (index > 7 && index < 13) ? 'MEDIUM' : 'EASY' }));

const $ = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[character]);
const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
let status = 'waiting'; let question = 0; let firebaseDatabase = null; let students = {};
let topics = {}; let selectedTopicId = 'transposition'; let editingQuestionId = null;

function sortedStudents() { return Object.values(students).sort((a, b) => b.score - a.score || a.totalTime - b.totalTime); }
function currentQuestions() { return topics[selectedTopicId]?.questions || []; }
function seedTopics() { return { transposition: { name: 'Transposition Techniques', questions: defaultQuestions } }; }
function questionRecord(data) { return { text: data.text, options: data.options, answer: Number(data.answer), difficulty: data.difficulty || 'EASY' }; }
function saveTopics() { if (firebaseDatabase) set(ref(firebaseDatabase, 'topics'), topics); $('topicSaveStatus').textContent = 'Saved just now'; setTimeout(() => { $('topicSaveStatus').textContent = 'Changes save automatically'; }, 1800); }
function clearQuestionForm() { editingQuestionId = null; $('questionForm').reset(); $('questionFormTitle').textContent = 'NEW QUESTION'; $('questionFormError').textContent = ''; }
function renderQuestionList() {
  const questions = currentQuestions();
  $('questionCount').textContent = questions.length;
  $('questionList').innerHTML = questions.length ? questions.map((item, index) => `<div class="question-list-row"><span class="question-number">${String(index + 1).padStart(2, '0')}</span><span class="question-list-text">${escapeHtml(item.text)}</span><span class="question-list-actions"><button type="button" class="text-button" data-edit-question="${index}">Edit</button><button type="button" class="text-button danger-text" data-delete-question="${index}">Delete</button></span></div>`).join('') : '<p class="muted">No questions yet. Add the first one.</p>';
  document.querySelectorAll('[data-edit-question]').forEach((button) => button.addEventListener('click', () => editQuestion(Number(button.dataset.editQuestion))));
  document.querySelectorAll('[data-delete-question]').forEach((button) => button.addEventListener('click', () => deleteQuestion(Number(button.dataset.deleteQuestion))));
}
function renderTopics() {
  const select = $('topicSelect');
  if (!Object.keys(topics).length) topics = seedTopics();
  if (!topics[selectedTopicId]) selectedTopicId = Object.keys(topics)[0];
  select.innerHTML = Object.entries(topics).map(([id, topic]) => `<option value="${escapeHtml(id)}">${escapeHtml(topic.name)}</option>`).join('');
  select.value = selectedTopicId;
  renderQuestionList(); renderQuestion();
}
function renderQuestion() {
  const current = currentQuestions()[Math.max(0, question - 1)];
  $('adminQuestion').textContent = `${question} / ${currentQuestions().length}`;
  $('adminQuestionText').textContent = current ? current.text : 'Waiting for the host to start the quiz.';
  $('adminDifficulty').textContent = current?.difficulty || 'EASY';
  $('adminChoices').innerHTML = current ? current.options.map((choice, index) => `<div class="admin-choice"><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(choice)}</div>`).join('') : '';
}
function render() {
  const roster = sortedStudents();
  $('adminStatus').textContent = status; $('adminOnline').textContent = roster.filter((student) => student.online).length;
  $('adminAnswers').textContent = roster.reduce((total, student) => total + (student.answeredQuestions || 0), 0);
  $('adminUpdated').textContent = roster.length ? `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Waiting for activity';
  $('adminLeaderboard').innerHTML = `<div class="leader-row head"><span>Rank</span><span>Student</span><span>Score</span><span>Answered</span><span>Time</span></div>${roster.length ? roster.map((student, index) => `<div class="leader-row"><span class="leader-rank">#${index + 1}</span><span>${escapeHtml(student.name)}<small class="muted"> ${escapeHtml(student.rollNo)}</small></span><span class="leader-score">${student.score} pts</span><span>${student.answeredQuestions || 0} / ${currentQuestions().length}</span><span>${formatTime(student.totalTime || 0)}</span></div>`).join('') : '<p class="muted">No students have joined yet.</p>'}`;
  renderQuestion();
}
function editQuestion(index) { const item = currentQuestions()[index]; if (!item) return; editingQuestionId = index; $('questionFormTitle').textContent = `EDIT QUESTION ${String(index + 1).padStart(2, '0')}`; $('questionTextInput').value = item.text; item.options.forEach((option, optionIndex) => { $(`option${optionIndex}Input`).value = option; }); $('correctAnswerInput').value = item.answer; $('difficultyInput').value = item.difficulty; $('questionTextInput').focus(); }
function deleteQuestion(index) { if (!confirm('Delete this question?')) return; topics[selectedTopicId].questions.splice(index, 1); clearQuestionForm(); saveTopics(); renderTopics(); render(); }
function connectFirebase() {
  if (!isFirebaseConfigured) { $('adminConnection').textContent = 'Configure Firebase'; return; }
  try {
    const app = initializeApp(firebaseConfig); firebaseDatabase = getDatabase(app);
    signInAnonymously(getAuth(app)).catch(() => { $('adminConnection').textContent = 'Auth failed'; });
    onValue(ref(firebaseDatabase, 'topics'), (snapshot) => { topics = snapshot.val() || {}; if (!Object.keys(topics).length) { topics = seedTopics(); saveTopics(); } renderTopics(); render(); });
    onValue(ref(firebaseDatabase, 'students'), (snapshot) => { students = snapshot.val() || {}; render(); });
    onValue(ref(firebaseDatabase, 'quiz'), (snapshot) => { const quiz = snapshot.val() || {}; status = quiz.status || 'waiting'; question = Number(quiz.currentQuestion || 0); if (quiz.topicId && topics[quiz.topicId]) selectedTopicId = quiz.topicId; renderTopics(); render(); });
    $('adminConnection').textContent = 'Live Firebase';
  } catch { $('adminConnection').textContent = 'Firebase error'; }
}

$('adminLoginForm').addEventListener('submit', (event) => { event.preventDefault(); if ($('adminPassword').value.trim() === 'admin123') { $('adminLogin').classList.add('hidden'); $('adminDashboard').classList.remove('hidden'); renderTopics(); render(); } else $('adminLoginError').textContent = 'Incorrect demonstration password.'; });
$('topicSelect').addEventListener('change', (event) => { selectedTopicId = event.target.value; question = 0; clearQuestionForm(); renderTopics(); render(); });
$('newTopicForm').addEventListener('submit', (event) => { event.preventDefault(); const name = $('newTopicName').value.trim(); if (!name) return; const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'topic'}-${Date.now()}`; topics[id] = { name, questions: [] }; selectedTopicId = id; $('newTopicName').value = ''; saveTopics(); renderTopics(); });
$('questionForm').addEventListener('submit', (event) => { event.preventDefault(); const text = $('questionTextInput').value.trim(); const options = [0, 1, 2, 3].map((index) => $(`option${index}Input`).value.trim()); if (!text || options.some((option) => !option)) { $('questionFormError').textContent = 'Enter a question and all four options.'; return; } const item = questionRecord({ text, options, answer: $('correctAnswerInput').value, difficulty: $('difficultyInput').value }); if (editingQuestionId === null) topics[selectedTopicId].questions.push(item); else topics[selectedTopicId].questions[editingQuestionId] = item; saveTopics(); clearQuestionForm(); renderTopics(); render(); });
$('cancelEditButton').addEventListener('click', clearQuestionForm);
$('startQuizButton').addEventListener('click', () => { if (currentQuestions().length < 1) { $('questionFormError').textContent = 'Add at least one question before starting.'; return; } status = 'Live'; question = 1; if (firebaseDatabase) set(ref(firebaseDatabase, 'quiz'), { status, currentQuestion: question, topicId: selectedTopicId }); render(); });
$('pauseQuizButton').addEventListener('click', () => { status = status === 'Paused' ? 'Live' : 'Paused'; if (firebaseDatabase) set(ref(firebaseDatabase, 'quiz/status'), status); render(); });
$('nextQuestionButton').addEventListener('click', () => { if (question < currentQuestions().length) question += 1; if (firebaseDatabase) set(ref(firebaseDatabase, 'quiz/currentQuestion'), question); render(); });
$('endQuizButton').addEventListener('click', () => { status = 'Ended'; if (firebaseDatabase) set(ref(firebaseDatabase, 'quiz/status'), status); render(); });
renderTopics(); render(); connectFirebase();
