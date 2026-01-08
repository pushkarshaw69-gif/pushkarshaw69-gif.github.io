import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/* =======================
   DOM REFERENCES
======================= */

const addBtn = document.getElementById("addBtn");
const formWrapper = document.getElementById("formWrapper");
const moviesForm = document.getElementById("moviesForm");
const moviesList = document.getElementById("moviesList");

const nameInput = document.getElementById("name");
const yearInput = document.getElementById("year");
const docIdInput = document.getElementById("docId");

const genreSelect = document.getElementById("genre");
const addGenreBtn = document.getElementById("addGenreBtn");
const newGenreInput = document.getElementById("newGenre");
const cancelBtn = document.getElementById("cancelBtn");

/* =======================
   FIRESTORE COLLECTIONS
======================= */

const moviesCol = collection(db, "movies");
const genresCol = collection(db, "genres");

/* =======================
   UI CONTROLS
======================= */

addBtn.onclick = () => formWrapper.classList.toggle("hidden");

cancelBtn.onclick = () => {
  moviesForm.reset();
  docIdInput.value = "";
  newGenreInput.classList.add("hidden");
  formWrapper.classList.add("hidden");
};

addGenreBtn.onclick = () => {
  newGenreInput.classList.toggle("hidden");
  newGenreInput.focus();
};

/* =======================
   GENRES (GLOBAL)
======================= */

async function loadGenres(selected = null) {
  genreSelect.innerHTML = "";

  const q = query(genresCol, orderBy("name"));
  const snap = await getDocs(q);

  snap.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.data().name;
    opt.textContent = d.data().name;
    genreSelect.appendChild(opt);
  });

  if (selected) genreSelect.value = selected;
}

newGenreInput.onchange = async () => {
  const genreName = newGenreInput.value.trim();
  if (!genreName) return;

  const snap = await getDocs(genresCol);
  for (const d of snap.docs) {
    if (d.data().name.toLowerCase() === genreName.toLowerCase()) {
      newGenreInput.value = "";
      newGenreInput.classList.add("hidden");
      loadGenres(genreName);
      return;
    }
  }

  await addDoc(genresCol, {
    name: genreName,
    createdAt: Date.now()
  });

  newGenreInput.value = "";
  newGenreInput.classList.add("hidden");
  loadGenres(genreName);
};

/* =======================
   MOVIES CRUD
======================= */

moviesForm.onsubmit = async (e) => {
  e.preventDefault();

  const data = {
    name: nameInput.value.trim(),
    year: Number(yearInput.value),
    genre: genreSelect.value
  };

  if (!data.name || !data.year || !data.genre) return;

  if (docIdInput.value) {
    await updateDoc(doc(db, "movies", docIdInput.value), data);
  } else {
    await addDoc(moviesCol, data);
  }

  moviesForm.reset();
  docIdInput.value = "";
  formWrapper.classList.add("hidden");
  loadMovies();
};

async function loadMovies() {
  moviesList.innerHTML = "";

  const snap = await getDocs(moviesCol);
  snap.forEach(d => {
    const m = d.data();

    const card = document.createElement("div");
    card.className = "movie-card";

    card.innerHTML = `
      <strong>${m.name}</strong><br>
      Year: ${m.year}<br>
      Genre: ${m.genre}

      <div class="card-actions">
        <span title="Edit" onclick="editMovie(
          '${d.id}',
          '${m.name.replace(/'/g, "\\'")}',
          '${m.year}',
          '${m.genre.replace(/'/g, "\\'")}'
        )">✏️</span>

        <span title="Delete" onclick="deleteMovie('${d.id}')">🗑️</span>
      </div>
    `;

    moviesList.appendChild(card);
  });
}

/* =======================
   GLOBAL FUNCTIONS
======================= */

window.editMovie = (id, n, y, g) => {
  formWrapper.classList.remove("hidden");
  docIdInput.value = id;
  nameInput.value = n;
  yearInput.value = y;
  loadGenres(g);
};

window.deleteMovie = async (id) => {
  if (!confirm("Delete this movie?")) return;
  await deleteDoc(doc(db, "movies", id));
  loadMovies();
};

/* =======================
   INIT
======================= */

loadGenres();
loadMovies();
