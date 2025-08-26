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

window.addEventListener("resize", setDispSize);

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
      if (isMouseDown) {
        ctx.fillStyle = "#77a3b8ff";
      } else {
        ctx.fillStyle = "#0095DD";
      }
    }
  }
  ctx.fill();
  ctx.closePath();
}

let isMouseDown = false;

function onMouseDown() {
  isMouseDown = true;
}

function onMouseUp() {
  isMouseDown = false;
  if (isMouseOverBt) buttonPush();
}

canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mouseup", onMouseUp, false);

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
const velcVar = 0.1;
let metarVelc = velcVar;

function buttonPush() {
  if (metarVelc === velcVar) metarVelc = 0;
  else metarVelc = velcVar;
}

function drawMeter() {
  ctx.beginPath();
  const gradient = ctx.createLinearGradient(
    canvas.width / 5,
    canvas.height - 20,
    canvas.width / 5,
    canvas.height - 20 - metarMaxNum * 15,
  );

  gradient.addColorStop(0, "#000000");
  gradient.addColorStop(1, "#bbbbbb");
  ctx.fillStyle = gradient;

  //ctx.fillStyle = "#898989ff";
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

  gradient2 = ctx.createLinearGradient(
    canvas.width / 5,
    canvas.height - 20,
    canvas.width / 5,
    canvas.height - 20 - metarMaxNum * 15,
  );

  gradient2.addColorStop(0, "#acad3fff");
  gradient2.addColorStop(0.4, "#ffd556ff");
  gradient2.addColorStop(0.8, "#fc260eff");
  gradient2.addColorStop(1, "#fc590eff");

  num = metarNum;

  ctx.beginPath();
  ctx.fillStyle = gradient2;
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

  metarNum += metarVelc;
  metarNum %= metarMaxNum;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawButton();
  drawMeter();
}
setInterval(draw, 10);
