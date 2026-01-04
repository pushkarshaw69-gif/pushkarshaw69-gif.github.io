const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const img = document.getElementById("matrixImage");

const fontSize = 16;
const chars = "0123456789";

const cols = Math.floor(canvas.width / fontSize);
const rows = Math.floor(canvas.height / fontSize);

let drops = new Array(cols).fill(0);
let mask = []; // image mask grid

img.onload = () => {
  // draw image into grid-sized offscreen canvas
  const off = document.createElement("canvas");
  off.width = cols;
  off.height = rows;
  const offCtx = off.getContext("2d");

  // center image into grid
  const scale = Math.min(cols / img.width, rows / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (cols - w) / 2;
  const y = (rows - h) / 2;

  offCtx.drawImage(img, x, y, w, h);

  const data = offCtx.getImageData(0, 0, cols, rows).data;

  // build boolean mask
  mask = [];
  for (let i = 0; i < data.length; i += 4) {
    mask.push(data[i + 3] > 20); // alpha check
  }

  // randomize drops
  drops = drops.map(() => Math.floor(Math.random() * rows));
};

function draw() {
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00ff9c";
  ctx.font = fontSize + "px monospace";

  for (let c = 0; c < cols; c++) {
    const r = drops[c];
    const index = r * cols + c;

    if (mask[index]) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, c * fontSize, r * fontSize);
    }

    drops[c]++;

    if (drops[c] > rows) {
      drops[c] = Math.floor(Math.random() * -20);
    }
  }
}

setInterval(draw, 70);

window.addEventListener("resize", () => {
  location.reload(); // simple + safe
});
