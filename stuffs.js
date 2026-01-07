import { startStuffMatrix } from "./stuff-matrix.js";

/* =========================
   START MATRIX
========================= */
const matrix = startStuffMatrix("matrix");

/* =========================
   BACKGROUND SWITCHING
========================= */
const bgs = {
  default: document.getElementById("bg-default"),
  series: document.getElementById("bg-series"),
  movies: document.getElementById("bg-movies"),
  documentary: document.getElementById("bg-documentary"),
};

function showBg(key) {
  Object.values(bgs).forEach(img => img.classList.remove("active"));
  bgs[key]?.classList.add("active");
}

/* =========================
   BUTTONS
========================= */
const seriesBtn = document.getElementById("seriesBtn");
const moviesBtn = document.getElementById("moviesBtn");
const docBtn = document.getElementById("docBtn");

/* Hover color + background (NO LOCK) */
seriesBtn.onmouseenter = () => {
  matrix.setColor("#ffd400");
  showBg("series");
};

moviesBtn.onmouseenter = () => {
  matrix.setColor("#1FB6FF"); // BLUE
  showBg("movies");
};

docBtn.onmouseenter = () => {
  matrix.setColor("#ff2b2b");
  showBg("documentary");
};

[seriesBtn, moviesBtn, docBtn].forEach(btn => {
  btn.onmouseleave = () => {
    matrix.setColor("#00ff9c");
    showBg("default");
  };
});

/* =========================
   MUSIC + MATRIX SYNC
========================= */
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();

const source = audioCtx.createMediaElementSource(music);
source.connect(analyser);
analyser.connect(audioCtx.destination);

analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);

let playing = false;

function syncMatrix() {
  analyser.getByteFrequencyData(dataArray);

  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }

  const energy = sum / dataArray.length / 255;
  matrix.setEnergy(energy);

  if (playing) requestAnimationFrame(syncMatrix);
}

musicBtn.onclick = async () => {
  if (!playing) {
    await audioCtx.resume();
    music.play();
    playing = true;
    syncMatrix();
    musicBtn.textContent = "⏸";
  } else {
    music.pause();
    playing = false;
    matrix.setEnergy(0);
    musicBtn.textContent = "▶";
  }
};
