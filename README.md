# Interactive Quiz Development – Transposition Techniques

A responsive HTML/CSS/JavaScript college project for a live quiz on transposition techniques in cryptography. It includes a student login, waiting room, timed quiz, live leaderboard, final results, host dashboard, and Firebase Realtime Database synchronization.

## Run locally

1. Open this folder in VS Code.
2. Install the **Live Server** extension, then right-click `index.html` and choose **Open with Live Server**.
3. Open `admin.html` in another tab to view the host dashboard. The host password is the value you configure for your deployment.

A web server is required because the app uses ES modules. Opening `index.html` directly with `file://` will block module imports in some browsers.

## Connect Firebase

1. Create a project at https://console.firebase.google.com/.
2. Add a Web app to the project and copy its configuration.
3. In **Build → Realtime Database**, create a database. For classroom testing only, start in test mode and replace the rules before production.
4. In **Build → Authentication → Sign-in method**, enable **Anonymous**.
5. Paste the Web app configuration into `firebase-config.js`, replacing every `YOUR_...` placeholder.
6. The app automatically listens and writes to `quiz/status`, `quiz/currentQuestion`, `students/{studentId}`, and `answers/{studentId}/{questionId}` after configuration.

Example development rules (do not use these open rules in production):

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "students": { "$studentId": { ".validate": "newData.hasChildren(['name', 'rollNo'])" } }
  }
}
```

For production, validate question identity, answer correctness, score, timer values, and duplicate roll numbers in trusted server-side code or Cloud Functions. Client-side anti-cheating protections are only demonstration safeguards.

## Firebase data shape

```text
quiz/
  status
  currentQuestion
  questions/
students/{studentId}/
  name, rollNo, score, correctAnswers, answeredQuestions, totalTime, rank, online
answers/{studentId}/{questionId}/
  selectedAnswer, correct, timeTaken, score
```

The included app is intentionally dependency-free and uses Firebase CDN imports/config placeholders so no npm install is required.
