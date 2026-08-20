// Replace these placeholders with your Firebase Web app configuration.
export const firebaseConfig = {
  apiKey: "AIzaSyAGzIgLCg5f3J1ruUux0Q2yCfvuazSSadM",
  authDomain: "quizz-8f39b.firebaseapp.com",
  databaseURL: "https://quizz-8f39b-default-rtdb.firebaseio.com",
  projectId: "quizz-8f39b",
  storageBucket: "quizz-8f39b.firebasestorage.app",
  messagingSenderId: "752173780654",
  appId: "1:752173780654:web:48c0810b3840b6b31f673f"
};

export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith("YOUR_") && !firebaseConfig.databaseURL.includes("YOUR_PROJECT");
