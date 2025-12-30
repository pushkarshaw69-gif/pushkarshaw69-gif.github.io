import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const coverInput = document.getElementById("cover");
const dateInput = document.getElementById("date");
const bookList = document.getElementById("bookList");

let currentUser = null;

// 🔐 WAIT FOR LOGIN
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  loadBooks();
});

// ➕ ADD BOOK
window.addBook = async () => {
  if (!currentUser) {
    alert("Not logged in");
    return;
  }

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const cover = coverInput.value.trim();
  const date = dateInput.value;

  if (!title || !author || !date) {
    alert("Fill all fields");
    return;
  }

  await addDoc(collection(db, "books"), {
    uid: currentUser.uid,
    title,
    author,
    cover,
    date
  });

  titleInput.value = "";
  authorInput.value = "";
  coverInput.value = "";
  dateInput.value = "";
};

// 📚 LOAD BOOKS
function loadBooks() {
  const q = query(
    collection(db, "books"),
    where("uid", "==", currentUser.uid)
  );

  onSnapshot(q, snapshot => {
    bookList.innerHTML = "";

    snapshot.forEach(doc => {
      const b = doc.data();

      bookList.innerHTML += `
        <div class="book">
          <img src="${b.cover || 'https://via.placeholder.com/80x110'}">
          <div class="book-info">
            <h3>${b.title}</h3>
            <p>✍ ${b.author}</p>
            <p>📅 ${b.date}</p>
          </div>
        </div>
      `;
    });
  });
}
