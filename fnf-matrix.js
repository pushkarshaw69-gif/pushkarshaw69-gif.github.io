const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

/* CONFIG */
const chars = "0123456789";
const fontSize = 16;
let rainColor = "#00ff9c"; // default green

let columns = [];
let lastTime = 0;

/* RESIZE */
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colCount = Math.floor(window.innerWidth / fontSize);
  columns = Array(colCount).fill(0);
}

window.addEventListener("resize", resize);
resize();

/* MATRIX LOOP – HEAVY */
function draw(time) {
  if (time - lastTime < 33) {
    requestAnimationFrame(draw);
    return;
  }
  lastTime = time;

  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = rainColor;
  ctx.font = `${fontSize}px monospace`;

  columns.forEach((y, i) => {
    const text = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(text, i * fontSize, y * fontSize);

    if (y * fontSize > canvas.height && Math.random() > 0.96) {
      columns[i] = 0;
    }
    columns[i]++;
  });

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

/* BUTTON INTERACTIONS */
const fictionBtn = document.getElementById("fictionBtn");
const nonFictionBtn = document.getElementById("nonFictionBtn");

if (fictionBtn) {
  fictionBtn.addEventListener("mouseenter", () => {
    rainColor = "#00aaff";
  });
  fictionBtn.addEventListener("mouseleave", () => {
    rainColor = "#00ff9c";
  });
}

if (nonFictionBtn) {
  nonFictionBtn.addEventListener("mouseenter", () => {
    rainColor = "#ff2b2b";
  });
  nonFictionBtn.addEventListener("mouseleave", () => {
    rainColor = "#00ff9c";
  });
}
