# Quiz Lab: Transposition Techniques

> A real-time, classroom-style cryptography quiz built with vanilla JavaScript and Firebase Realtime Database.

Quiz Lab turns a set of questions about classical transposition ciphers into a live multiplayer session. Students join with their name and roll number, answer timed questions, and see the leaderboard update in real time. A separate host dashboard controls the session from start to finish.

## Highlights

- Student login with duplicate roll-number protection
- Waiting room that stays synchronized with the host
- 15 questions covering Rail Fence, columnar transposition, permutations, and classical cryptography
- 15-second timer for every question
- Score calculation with accuracy and speed bonuses
- Live leaderboard with rank, score, answered questions, and time
- Final results view with podium and participant summary
- Host dashboard with start, pause, next-question, and end-session controls
- Host-assigned quiz passcode required before students can join
- Host-side topic manager for creating separate quiz subjects
- Question editor for adding, editing, and deleting questions without changing code
- Responsive interface for desktop and mobile screens
- Anonymous Firebase Authentication with Realtime Database synchronization
- No build step or npm dependencies required

## Tech stack

| Area | Technology |
| --- | --- |
| Interface | HTML5, CSS3, responsive CSS |
| Application logic | Vanilla JavaScript ES modules |
| Realtime backend | Firebase Realtime Database |
| Authentication | Firebase Anonymous Authentication |
| Fonts | Space Grotesk and DM Mono via Google Fonts |
| Local development | Any static web server, such as VS Code Live Server |

## Project structure

```text
.
|-- index.html           # Student experience
|-- admin.html           # Host dashboard
|-- script.js            # Student flow, quiz logic, scoring, leaderboard
|-- admin.js             # Host controls and live participant view
|-- question-manager.html # Add, edit, and delete quiz questions
|-- live.html             # Live controls, current question, and ranking
|-- firebase-config.js   # Firebase Web App configuration
|-- style.css            # Main visual system
|-- ux.css               # Interaction states and responsive refinements
|-- theme.css             # Dark visual theme
|-- interactions.js       # Hover, tilt, ripple, and reveal interactions
|-- question-manager.js   # Question manager behavior
|-- live.js               # Live room behavior
`-- README.md
```

## Run locally

1. Clone or download this repository and open it in VS Code.
2. Start a local static server. With the **Live Server** extension, right-click `index.html` and select **Open with Live Server**.
3. Open `admin.html` in a second browser tab or window for the host view.
4. Open `index.html` in one or more additional tabs to simulate students.

The app uses ES modules, so it should be served over `http://localhost` rather than opened directly with a `file://` URL.

## Firebase setup

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Add a Web App and copy its configuration into `firebase-config.js`.
3. Create a **Realtime Database** in the Firebase console.
4. Enable **Authentication > Sign-in method > Anonymous**.
5. Configure Realtime Database rules for authenticated users.
6. Start the local server and verify that the connection indicator reports **Live Firebase**.

For classroom or demo testing, these rules are a minimal starting point. Review and tighten them before sharing the application publicly:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "students": {
      "$studentId": {
        ".validate": "newData.hasChildren(['name', 'rollNo'])"
      }
    }
  }
}
```

The application reads and writes these main paths:

```text
quiz/
  status
  currentQuestion
  topicId
  accessCode
topics/{topicId}/
  name
  questions/{questionId}/
    text, options, answer, difficulty
students/{studentId}/
  name, rollNo, score, correctAnswers, answeredQuestions, totalTime, online
answers/{studentId}/{questionId}/
  selectedAnswer, correct, timeTaken, score
```

## Security note

This is an academic demonstration, not a production assessment platform. Quiz questions, answer validation, scoring, and the host password currently live in client-side JavaScript. Before production use, move scoring and host authorization to trusted server-side code or Firebase Cloud Functions, validate question identity and timer values, prevent score tampering, and add stricter database rules. Never use open test-mode rules for a public deployment.

## Manage topics and questions

1. Open `question-manager.html` and unlock the content studio with the configured demonstration password.
2. Select an existing topic or create a new topic with **Add topic**.
3. Use **Save question** to add four-option questions, or select **Edit** beside an existing question.
4. Open `live.html` to start the session, advance questions, pause, end the quiz, and monitor the live ranking.
5. Set a quiz passcode in the Live Room before starting. Students must enter that passcode to join.
6. Students automatically receive the active topic selected by the host.

Topics and questions are stored in Firebase under `topics`, while the current session stores its selected topic under `quiz.topicId`.

## Customization

- Edit the `questions` array in `script.js` and `admin.js` to change the quiz content.
- Adjust the timer and scoring formula in `script.js`.
- Update the visual theme in `style.css` and `ux.css`.
- Replace the demonstration host password in `admin.js` before deployment.

## LinkedIn project description

Built **Quiz Lab**, a real-time interactive cryptography quiz using vanilla JavaScript and Firebase Realtime Database. The project includes timed questions, speed-based scoring, live leaderboards, anonymous authentication, student quiz passcodes, and dedicated host pages for managing content and classroom sessions. It was designed as an academic project for Cryptography and Cybersecurity.

## License

This project is intended for educational and portfolio use.
