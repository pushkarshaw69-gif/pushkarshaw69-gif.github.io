const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const img = document.getElementById("matrixImage");
const fontSize = 14;

let columns = Math.floor(canvas.width / fontSize);
let drops = [];
let imgData = null;

img.onload = () => {
  // draw image to offscreen canvas to read pixels
  const off = document.createElement("canvas");
  off.width = img.width;
  off.height = img.height;
  const offCtx = off.getContext("2d");
  offCtx.drawImage(img, 0, 0);
  imgData = offCtx.getImageData(0, 0, img.width, img.height).data;

  drops = Array.from({ length: columns }).map(() =>
    Math.random() * canvas.height
  );
};

function draw() {
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const imgX = canvas.width / 2 - img.width / 2;
  const imgY = canvas.height / 2 - img.height / 2;

  ctx.fillStyle = "#00ff9c";

  drops.forEach((y, i) => {
    const x = i * fontSize;

    const px = Math.floor(x - imgX);
    const py = Math.floor(y - imgY);

    if (
      imgData &&
      px >= 0 && py >= 0 &&
      px < img.width && py < img.height
    ) {
      const alpha = imgData[(py * img.width + px) * 4 + 3];
      if (alpha > 20) {
        ctx.fillRect(x, y, fontSize - 2, fontSize - 2);
      }
    }

    drops[i] += fontSize;
    if (drops[i] > canvas.height) {
      drops[i] = Math.random() * -canvas.height;
    }
  });
}

setInterval(draw, 70);
