import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// Auto redirect if already logged in
onAuthStateChanged(auth, user => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});

// Login button
document.getElementById("loginBtn").onclick = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .catch(err => alert(err.message));
};
