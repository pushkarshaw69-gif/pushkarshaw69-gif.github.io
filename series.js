import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const addBtn = document.getElementById("addBtn");
const formWrapper = document.getElementById("formWrapper");
const seriesForm = document.getElementById("seriesForm");
const seriesList = document.getElementById("seriesList");

const genreSelect = document.getElementById("genre");
const addGenreBtn = document.getElementById("addGenreBtn");
const newGenreInput = document.getElementById("newGenre");
const cancelBtn = document.getElementById("cancelBtn");

let genres = ["Drama", "Sci-Fi", "Thriller"];

function loadGenres() {
  genreSelect.innerHTML = "";
  genres.forEach(g => {
    const option = document.createElement("option");
    option.value = g;
    option.textContent = g;
    genreSelect.appendChild(option);
  });
}

loadGenres();

addBtn.onclick = () => formWrapper.classList.toggle("hidden");

cancelBtn.onclick = () => {
  seriesForm.reset();
  formWrapper.classList.add("hidden");
};

addGenreBtn.onclick = () => {
  newGenreInput.classList.toggle("hidden");
};

newGenreInput.onchange = () => {
  const g = newGenreInput.value.trim();
  if (g && !genres.includes(g)) {
    genres.push(g);
    loadGenres();
    genreSelect.value = g;
  }
  newGenreInput.value = "";
  newGenreInput.classList.add("hidden");
};

seriesForm.onsubmit = async (e) => {
  e.preventDefault();

  const id = docId.value;
  const data = {
    name: name.value,
    seasons: seasons.value,
    genre: genre.value
  };

  if (id) {
    await updateDoc(doc(db, "series", id), data);
  } else {
    await addDoc(collection(db, "series"), data);
  }

  seriesForm.reset();
  docId.value = "";
  formWrapper.classList.add("hidden");
  loadSeries();
};

async function loadSeries() {
  seriesList.innerHTML = "";
  const snap = await getDocs(collection(db, "series"));

  snap.forEach(d => {
    const s = d.data();

    const card = document.createElement("div");
    card.className = "series-card";

    card.innerHTML = `
      <strong>${s.name}</strong><br>
      Seasons: ${s.seasons}<br>
      Genre: ${s.genre}
      <div class="card-actions">
        <span onclick="editSeries('${d.id}','${s.name}','${s.seasons}','${s.genre}')">✏️</span>
        <span onclick="deleteSeries('${d.id}')">🗑️</span>
      </div>
    `;

    seriesList.appendChild(card);
  });
}

window.editSeries = (id, n, s, g) => {
  formWrapper.classList.remove("hidden");
  docId.value = id;
  name.value = n;
  seasons.value = s;
  genre.value = g;
};

window.deleteSeries = async (id) => {
  if (confirm("Delete this series?")) {
    await deleteDoc(doc(db, "series", id));
    loadSeries();
  }
};

loadSeries();
