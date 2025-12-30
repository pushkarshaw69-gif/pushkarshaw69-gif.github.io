import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLsWVXHXWncqbwG4LSePSNW74savjc0u4",
  authDomain: "ap-website-4f10a.firebaseapp.com",
  projectId: "ap-website-4f10a",
  storageBucket: "ap-website-4f10a.appspot.com",
  messagingSenderId: "729878410948",
  appId: "1:729878410948:web:bf389d03f8ba35ef2c7b91"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);