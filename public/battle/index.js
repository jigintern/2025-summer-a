const canvas = document.getElementById("battle_canvas");

const ctx = canvas.getContext("2d");

function setDispSize() {
  const area = document.getElementById("window_main");
  console.log(area.clientWidth);
  console.log(area.clientHeight);
  canvas.width = area.clientWidth;
  canvas.height = area.clientHeight;
  console.log("x:" + canvas.width);
  console.log("y:" + canvas.height);
}

setDispSize();

let mouseX = 0;
let mouseY = 0;

let isMouseOverBt = false;

function drawButton() {
  ctx.beginPath();
  const x = canvas.width / 2 - 40;
  const y = canvas.height - 100;
  ctx.rect(x, y, 80, 50);
  ctx.fillStyle = "#ff0000ff";
  isMouseOverBt = false;
  if (mouseX < canvas.width / 2 + 40 && mouseX > canvas.width / 2 - 40) {
    if (mouseY < canvas.height - 50 && mouseY > canvas.height - 100) {
      isMouseOverBt = true;
      ctx.fillStyle = "#0095DD";
    }
  }
  ctx.fill();
  ctx.closePath();
}

canvas.addEventListener("mousemove", function (evt) {
  const mousePos = getMousePosition(canvas, evt);
  mouseX = mousePos[0];
  mouseY = mousePos[1];
  console.log("maxX:" + canvas.width);
  console.log("maxY:" + canvas.height);
  console.log("x:" + mousePos[0]);
  console.log("y" + mousePos[1]);
}, false);

function getMousePosition(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return [evt.clientX - rect.left, evt.clientY - rect.top];
}

let metarNum = 0;
const metarMaxNum = 10;
const metarVelc = 0.05;

function drawMeter() {
  ctx.beginPath();
  ctx.fillStyle = "#898989ff";
  ctx.moveTo(canvas.width / 5, canvas.height - 20);
  ctx.lineTo(
    canvas.width / 5 - canvas.width / 20,
    canvas.height - 20 - metarMaxNum * 15,
  );
  ctx.lineTo(
    canvas.width / 5 + canvas.width / 20,
    canvas.height - 20 - metarMaxNum * 15,
  );
  ctx.fill();
  ctx.closePath();

  let num;

  if (metarNum < metarMaxNum / 5) num = metarNum;
  else num = metarMaxNum / 5;

  ctx.beginPath();
  ctx.fillStyle = "#bbff00ff";
  ctx.moveTo(canvas.width / 5, canvas.height - 20);
  ctx.lineTo(
    canvas.width / 5 - canvas.width * num / metarMaxNum / 20,
    canvas.height - 20 - num * 15,
  );
  ctx.lineTo(
    canvas.width / 5 + canvas.width * num / metarMaxNum / 20,
    canvas.height - 20 - num * 15,
  );
  ctx.fill();
  ctx.closePath();

  const colors = [
    "#bbff00ff",
    "#00a6ffff",
    "#002fffff",
    "#e600ffff",
    "#ff002bff",
  ];

  for (let i = 1; i < 5; i++) {
    if (metarNum < metarMaxNum / 5 * i) break;
    if (metarNum > metarMaxNum / 5 * (i + 1)) {
      num = metarMaxNum / 5 * (i + 1);
    } else num = metarNum;
    ctx.beginPath();
    ctx.fillStyle = colors[i];
    ctx.moveTo(
      canvas.width / 5 - canvas.width / 5 * i / 20,
      canvas.height - 20 - metarMaxNum / 5 * i * 15,
    );
    ctx.lineTo(
      canvas.width / 5 - canvas.width * num / metarMaxNum / 20,
      canvas.height - 20 - num * 15,
    );
    ctx.lineTo(
      canvas.width / 5 + canvas.width * num / metarMaxNum / 20,
      canvas.height - 20 - num * 15,
    );
    ctx.lineTo(
      canvas.width / 5 + canvas.width / 5 * i / 20,
      canvas.height - 20 - metarMaxNum / 5 * i * 15,
    );
    ctx.fill();
    ctx.closePath();
  }

  metarNum += metarVelc;
  metarNum %= metarMaxNum;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawButton();
  drawMeter();
}
setInterval(draw, 10);
