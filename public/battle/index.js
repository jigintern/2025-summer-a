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

let isButtonEnable = true;
let isMetarEnable = true;

function drawButton() {
  ctx.beginPath();
  let x = canvas.width / 2 - 40;
  let y = canvas.height - 100;
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
  ctx.fillStyle = "#000000";
  x = canvas.width / 2;
  y = canvas.height - 75;
  ctx.textAlign = "center";
  ctx.font = "20px 'MS P Gothic'";
  ctx.fillText("Push!!", x, y);
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
const powerImg = new Image();
powerImg.addEventListener("load", () => {
});
powerImg.src = "power.png";

let x_m = 200;
let y_m = 200;
let size_m = 20;

function drawMeter() {
  const x = x_m + canvas.width / 5;
  const y = canvas.height - 150;
  const w = canvas.width / 10;
  const h = metarMaxNum * 15;

  ctx.beginPath();
  const gradient = ctx.createLinearGradient(
    x,
    y,
    x,
    y - h,
  );

  gradient.addColorStop(0, "#000000");
  gradient.addColorStop(1, "#bbbbbb");
  ctx.fillStyle = gradient;

  //ctx.fillStyle = "#898989ff";
  ctx.moveTo(x, y);
  ctx.lineTo(
    x - w / 2,
    y - h,
  );
  ctx.lineTo(
    x + w / 2,
    y - h,
  );
  ctx.fill();
  ctx.closePath();

  gradient2 = ctx.createLinearGradient(
    x,
    y,
    x,
    x - h,
  );

  gradient2.addColorStop(0, "#acad3fff");
  gradient2.addColorStop(0.4, "#ffd556ff");
  gradient2.addColorStop(0.8, "#fc260eff");
  gradient2.addColorStop(1, "#fc590eff");

  const num = metarNum;

  ctx.beginPath();
  ctx.fillStyle = gradient2;
  ctx.moveTo(x, y);
  ctx.lineTo(
    x - w / 2 * num / metarMaxNum,
    y - h * num / metarMaxNum,
  );
  ctx.lineTo(
    x + w / 2 * num / metarMaxNum,
    y - h * num / metarMaxNum,
  );
  ctx.fill();
  const scale = 1.25;
  ctx.drawImage(
    powerImg,
    x - w / scale,
    y - w / 1,
    w * 2 / scale,
    w * 2 / scale,
  );
  ctx.closePath();

  metarNum += metarVelc;
  metarNum %= metarMaxNum;
}

let isArrow = true;

const arrowImg = new Image();
arrowImg.addEventListener("load", () => {
});
arrowImg.src = "arrow.png";

let angle = 0;
const angleVelc = Math.PI * 2 / 150;
let sizeAngle = 0;
let sizex = 1;
let sizey = 1;

function drawArrow() {
  ctx.beginPath();
  ctx.save();
  ctx.translate(x_m, y_m);
  ctx.rotate(angle);
  sizey = 100 + 15 * Math.sin(sizeAngle);
  sizex = 100;
  ctx.drawImage(arrowImg, -sizex / 2, -sizey - 25, sizex, sizey);
  ctx.restore();
  ctx.closePath();
  sizeAngle -= angleVelc * 3.25;
  angle -= angleVelc;
  if (angle < 0) angle += Math.PI * 2;
  if (sizeAngle < 0) sizeAngle += Math.PI * 2;
}

function drawMyAA() {
  ctx.beginPath();
  ctx.arc(x_m, y_m, size_m, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.closePath();
}

function testDraw() {
  ctx.fillStyle = "#000000";
  ctx.fillText(Math.floor(metarNum * 10) / 10, 100, 100);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMyAA();
  if (isButtonEnable) drawButton();
  if (isMetarEnable) drawMeter();
  if (isArrow) drawArrow();
  testDraw();
}
setInterval(draw, 10);
