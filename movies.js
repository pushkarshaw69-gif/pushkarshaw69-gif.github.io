import { auth, db } from "./firebase.js";
import {
  collection, addDoc, deleteDoc, updateDoc,
  doc, query, where, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

let movies = [];
let genres = [];
let selectedGenres = [];
let editSelectedGenres = [];
let editId = null;
let deleteId = null;
let user = null;

/* ELEMENTS */
const list = document.getElementById("movieList");
const totalCount = document.getElementById("totalCount");
const seenCount = document.getElementById("seenCount");
const unseenCount = document.getElementById("unseenCount");

const genreSelect = document.getElementById("genreSelect");
const genreInput = document.getElementById("genreInput");
const genreTags = document.getElementById("genreTags");

const editGenreSelect = document.getElementById("editGenreSelect");
const editGenreInput = document.getElementById("editGenreInput");
const editGenreTags = document.getElementById("editGenreTags");

/* AUTH */
onAuthStateChanged(auth, u => {
  if (!u) location.href = "index.html";
  user = u;
  loadMovies();
  loadGenres();
});

/* GENRES */
function loadGenres() {
  onSnapshot(collection(db, "movieGenres"), snap => {
    genres = snap.docs.map(d => d.data().name);
    populateGenreSelects();
  });
}

function populateGenreSelects() {
  const opts = `<option value="">Select genre</option>` +
    genres.map(g => `<option value="${g}">${g}</option>`).join("");
  genreSelect.innerHTML = opts;
  editGenreSelect.innerHTML = opts;
}

async function ensureGenreExists(name) {
  if (!name || genres.includes(name)) return;
  await addDoc(collection(db, "movieGenres"), { name });
}

/* GENRE TAG LOGIC */
function addGenre(name, isEdit = false) {
  if (!name) return;
  const list = isEdit ? editSelectedGenres : selectedGenres;
  if (list.includes(name)) return;

  list.push(name);
  ensureGenreExists(name);
  renderGenreTags(isEdit);
}

function renderGenreTags(isEdit = false) {
  const container = isEdit ? editGenreTags : genreTags;
  const list = isEdit ? editSelectedGenres : selectedGenres;
  container.innerHTML = "";

  list.forEach(g => {
    const tag = document.createElement("div");
    tag.className = "genre-tag";
    tag.textContent = g;
    tag.onclick = () => {
      list.splice(list.indexOf(g), 1);
      renderGenreTags(isEdit);
    };
    container.appendChild(tag);
  });
}

genreSelect.onchange = () => {
  addGenre(genreSelect.value);
  genreSelect.value = "";
};

genreInput.onkeydown = e => {
  if (e.key === "Enter") {
    addGenre(genreInput.value.trim());
    genreInput.value = "";
  }
};

editGenreSelect.onchange = () => {
  addGenre(editGenreSelect.value, true);
  editGenreSelect.value = "";
};

editGenreInput.onkeydown = e => {
  if (e.key === "Enter") {
    addGenre(editGenreInput.value.trim(), true);
    editGenreInput.value = "";
  }
};

/* ADD MOVIE */
addMovie.onclick = async () => {
  if (!title.value.trim()) return;

  await addDoc(collection(db, "movies"), {
    uid: user.uid,
    title: title.value.trim(),
    director: director.value,
    genres: selectedGenres,
    seen: seen.value
  });

  title.value = director.value = "";
  selectedGenres = [];
  renderGenreTags();
};

/* LOAD MOVIES */
function loadMovies() {
  const q = query(collection(db, "movies"), where("uid", "==", user.uid));
  onSnapshot(q, snap => {
    movies = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    applyFilters();
    updateStats();
  });
}

/* STATS */
function updateStats() {
  totalCount.textContent = `Total: ${movies.length}`;
  seenCount.textContent = `Seen: ${movies.filter(m => m.seen === "seen").length}`;
  unseenCount.textContent = `Not Seen: ${movies.filter(m => m.seen === "unseen").length}`;
}

/* RENDER */
function render(data) {
  list.innerHTML = "";
  data.forEach(m => {
    const card = document.createElement("div");
    card.className = "movie-card";

    card.innerHTML = `
      <div class="movie-info">
        <strong>${m.title}</strong>
        <span class="badge ${m.seen}">${m.seen === "seen" ? "Seen" : "Not Seen"}</span>
        <div>${m.director || ""}</div>
        <div class="tags">${(m.genres || []).join(", ")}</div>
      </div>
      <div class="actions">
        <button class="edit">✏️</button>
        <button class="del">🗑️</button>
      </div>
    `;

    card.querySelector(".badge").onclick = () => toggleSeen(m.id);
    card.querySelector(".edit").onclick = () => openEdit(m.id);
    card.querySelector(".del").onclick = () => askDelete(m.id);

    list.appendChild(card);
  });
}

/* SEARCH + FILTER */
search.oninput = filterSeen.onchange = applyFilters;

function applyFilters() {
  const q = search.value.toLowerCase();
  const f = filterSeen.value;

  render(movies.filter(m =>
    (!q ||
      m.title.toLowerCase().includes(q) ||
      (m.director || "").toLowerCase().includes(q) ||
      (m.genres || []).join(",").toLowerCase().includes(q)
    ) &&
    (f === "all" || m.seen === f)
  ));
}

/* TOGGLE SEEN */
async function toggleSeen(id) {
  const movie = movies.find(m => m.id === id);
  await updateDoc(doc(db, "movies", id), {
    seen: movie.seen === "seen" ? "unseen" : "seen"
  });
}

/* EDIT */
function openEdit(id) {
  const m = movies.find(x => x.id === id);
  editId = id;

  editTitle.value = m.title;
  editDirector.value = m.director;
  editSeen.value = m.seen;

  editSelectedGenres = [...(m.genres || [])];
  renderGenreTags(true);

  editOverlay.classList.remove("hidden");
}

saveEdit.onclick = async () => {
  await updateDoc(doc(db, "movies", editId), {
    title: editTitle.value,
    director: editDirector.value,
    genres: editSelectedGenres,
    seen: editSeen.value
  });
  editOverlay.classList.add("hidden");
};

cancelEdit.onclick = () => editOverlay.classList.add("hidden");

/* DELETE */
function askDelete(id) {
  deleteId = id;
  deleteOverlay.classList.remove("hidden");
}

confirmDelete.onclick = async () => {
  await deleteDoc(doc(db, "movies", deleteId));
  deleteOverlay.classList.add("hidden");
};

cancelDelete.onclick = () => deleteOverlay.classList.add("hidden");

/* BACK */
backBtn.onclick = () => history.back();
