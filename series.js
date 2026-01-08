import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/* =====================
   STATE
===================== */
let series = [];
let editingId = null;
let deleteId = null;

/* =====================
   ELEMENTS
===================== */
const seriesForm = document.getElementById("seriesForm");
const toggleFormBtn = document.getElementById("addBtn");
const seriesList = document.getElementById("seriesList");

const nameInput = document.getElementById("name");
const seasonsInput = document.getElementById("seasons");
const genreSelect = document.getElementById("genre");

const newGenreInput = document.getElementById("newGenre");
const addGenreBtn = document.getElementById("addGenreBtn");

/* EDIT OVERLAY */
const editOverlay = document.getElementById("editOverlay");
const editName = document.getElementById("editName");
const editSeasons = document.getElementById("editSeasons");
const editGenre = document.getElementById("editGenre");

/* =====================
   UI
===================== */
toggleFormBtn.onclick =
  () => seriesForm.classList.toggle("hidden");

addGenreBtn.onclick = () => {
  newGenreInput.classList.toggle("hidden");
  newGenreInput.focus();
};

/* =====================
   GENRES (GLOBAL)
===================== */
const genresCol = collection(db, "genres");

function loadGenres(select = null) {
  onSnapshot(
    query(genresCol, orderBy("name")),
    snap => {
      genreSelect.innerHTML = "";
      editGenre.innerHTML = "";

      snap.forEach(d => {
        const g = d.data().name;

        genreSelect.innerHTML += `<option>${g}</option>`;
        editGenre.innerHTML += `<option>${g}</option>`;
      });

      if (select) editGenre.value = select;
    }
  );
}

newGenreInput.onchange = async () => {
  const g = newGenreInput.value.trim();
  if (!g) return;

  await addDoc(genresCol, { name: g });
  newGenreInput.value = "";
  newGenreInput.classList.add("hidden");
};

/* =====================
   ADD SERIES
===================== */
window.addSeries = async () => {
  if (!nameInput.value.trim()) return;

  await addDoc(collection(db, "series"), {
    name: nameInput.value.trim(),
    seasons: Number(seasonsInput.value),
    genre: genreSelect.value
  });

  seriesForm.classList.add("hidden");
  nameInput.value = "";
  seasonsInput.value = "";
};

/* =====================
   LOAD SERIES
===================== */
function loadSeries() {
  const q = query(collection(db, "series"), orderBy("name"));

  onSnapshot(q, snap => {
    series = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderSeries(series);
  });
}

/* =====================
   RENDER
===================== */
function renderSeries(list) {
  seriesList.innerHTML = "";

  list.forEach(s => {
    seriesList.innerHTML += `
      <div class="series-row">
        <div class="series-actions">
          <button onclick="editSeries('${s.id}')">✏️</button>
          <button onclick="askDelete('${s.id}')">🗑️</button>
        </div>

        <p class="series-name">${s.name}</p>
        <p class="series-meta">
          ${s.seasons} season${s.seasons > 1 ? "s" : ""} · ${s.genre}
        </p>
      </div>
    `;
  });
}

/* =====================
   EDIT
===================== */
window.editSeries = id => {
  const s = series.find(x => x.id === id);
  editingId = id;

  editName.value = s.name;
  editSeasons.value = s.seasons;
  editGenre.value = s.genre;

  editOverlay.classList.remove("hidden");
};

window.saveEdit = async () => {
  await updateDoc(doc(db, "series", editingId), {
    name: editName.value.trim(),
    seasons: Number(editSeasons.value),
    genre: editGenre.value
  });

  editOverlay.classList.add("hidden");
};

window.closeEdit = () =>
  editOverlay.classList.add("hidden");

/* =====================
   DELETE
===================== */
window.askDelete = id => {
  deleteId = id;
  document.getElementById("confirmBox").classList.remove("hidden");
};

window.confirmDelete = async () => {
  await deleteDoc(doc(db, "series", deleteId));
  closeConfirm();
};

window.closeConfirm = () =>
  document.getElementById("confirmBox").classList.add("hidden");

/* =====================
   INIT
===================== */
loadGenres();
loadSeries();
