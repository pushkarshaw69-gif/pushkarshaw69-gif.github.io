const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const img = document.getElementById("matrixImage");
const fontSize = 14;

let columns = Math.floor(canvas.width / fontSize);
let drops = [];

img.onload = () => {
  drops = Array.from({ length: columns }).map(() =>
    Math.random() * canvas.height
  );
};

function draw() {
  // smooth trail
  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // image positioning
  const imgX = canvas.width / 2 - img.width / 2;
  const imgY = canvas.height / 2 - img.height / 2;

  // faint ghost image
  ctx.globalAlpha = 0.08;
  ctx.drawImage(img, imgX, imgY);
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#00ff9c";

  drops.forEach((y, i) => {
    const x = i * fontSize;

    // sample image pixels
    const px = Math.floor(x - imgX);
    const py = Math.floor(y - imgY);

    if (
      px >= 0 && py >= 0 &&
      px < img.width && py < img.height
    ) {
      ctx.fillRect(x, y, fontSize - 2, fontSize - 2);
    }

    y += fontSize;
    drops[i] = y > canvas.height ? Math.random() * -canvas.height : y;
  });
}

setInterval(draw, 70);

// handle resize
window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  columns = Math.floor(canvas.width / fontSize);
};
