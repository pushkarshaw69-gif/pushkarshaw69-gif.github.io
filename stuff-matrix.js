/* =========================
   STUFF MATRIX ENGINE
   (Balanced & Non-Overlapping)
========================= */

export function startStuffMatrix({
  canvasId = "matrix",
  color = "#00ff9c",
  density = 1.2,     // calmer horizontal density
  fontSize = 14,
  speed = 0.6,       // normal Matrix pace
  trail = 0.06       // clean long trails (NOT aggressive)
} = {}) {

  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const chars = "0123456789";
  let rainColor = color;
  let columns = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Each column tracks row index (integer only)
    columns = Array(
      Math.floor((window.innerWidth / fontSize) * density)
    ).fill(0);
  }

  window.addEventListener("resize", resize);
  resize();

  function draw() {
    /* Fade previous frame WITHOUT darkening background */
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = `rgba(0,0,0,${trail})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = rainColor;
    ctx.font = `${fontSize}px monospace`;

    columns.forEach((row, i) => {
      // Draw ONE digit per row (no overlap)
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = row * fontSize * 1.1; // extra vertical spacing

      ctx.fillText(char, x, y);

      // Reset column naturally
      if (y > canvas.height && Math.random() > 0.97) {
        columns[i] = 0;
      } else {
        columns[i] += speed;
      }
    });

    requestAnimationFrame(draw);
  }

  draw();

  return {
    setColor(newColor) {
      rainColor = newColor;
    }
  };
}
