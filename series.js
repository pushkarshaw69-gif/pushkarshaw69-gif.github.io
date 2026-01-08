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
const seriesForm = document.getElementById("seriesForm");
const seriesList = document.getElementById("seriesList");

const genreSelect = document.getElementById("genre");
const addGenreBtn = document.getElementById("addGenreBtn");
const newGenreInput = document.getElementById("newGenre");
const cancelBtn = document.getElementById("cancelBtn");

/* =======================
   FIRESTORE COLLECTIONS
======================= */

const seriesCol = collection(db, "series");
const genresCol = collection(db, "genres");

/* =======================
   UI CONTROLS
======================= */

addBtn.onclick = () => formWrapper.classList.toggle("hidden");

cancelBtn.onclick = () => {
  seriesForm.reset();
  docId.value = "";
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
  const name = newGenreInput.value.trim();
  if (!name) return;

  // prevent duplicates
  const snap = await getDocs(genresCol);
  for (const d of snap.docs) {
    if (d.data().name.toLowerCase() === name.toLowerCase()) {
      newGenreInput.value = "";
      newGenreInput.classList.add("hidden");
      loadGenres(name);
      return;
    }
  }

  await addDoc(genresCol, {
    name,
    createdAt: Date.now()
  });

  newGenreInput.value = "";
  newGenreInput.classList.add("hidden");
  loadGenres(name);
};

/* =======================
   SERIES CRUD
======================= */

seriesForm.onsubmit = async (e) => {
  e.preventDefault();

  const data = {
    name: name.value.trim(),
    seasons: Number(seasons.value),
    genre: genre.value
  };

  if (!data.name || !data.seasons || !data.genre) return;

  if (docId.value) {
    await updateDoc(doc(db, "series", docId.value), data);
  } else {
    await addDoc(seriesCol, data);
  }

  seriesForm.reset();
  docId.value = "";
  formWrapper.classList.add("hidden");
  loadSeries();
};

async function loadSeries() {
  seriesList.innerHTML = "";

  const snap = await getDocs(seriesCol);
  snap.forEach(d => {
    const s = d.data();

    const card = document.createElement("div");
    card.className = "series-card";

    card.innerHTML = `
      <strong>${s.name}</strong><br>
      Seasons: ${s.seasons}<br>
      Genre: ${s.genre}

      <div class="card-actions">
        <span title="Edit" onclick="editSeries(
          '${d.id}',
          '${s.name.replace(/'/g,"\\'")}',
          '${s.seasons}',
          '${s.genre.replace(/'/g,"\\'")}'
        )">✏️</span>

        <span title="Delete" onclick="deleteSeries('${d.id}')">🗑️</span>
      </div>
    `;

    seriesList.appendChild(card);
  });
}

/* =======================
   GLOBAL FUNCTIONS
======================= */

window.editSeries = (id, n, s, g) => {
  formWrapper.classList.remove("hidden");
  docId.value = id;
  name.value = n;
  seasons.value = s;
  loadGenres(g);
};

window.deleteSeries = async (id) => {
  if (!confirm("Delete this series?")) return;
  await deleteDoc(doc(db, "series", id));
  loadSeries();
};

/* =======================
   INIT
======================= */

loadGenres();
loadSeries();
