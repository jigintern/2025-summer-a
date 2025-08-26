const canvas = document.getElementById("battle_canvas");

const ctx = canvas.getContext("2d");

//ウィンドウサイズが変わった時の処理
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

//ボタンの描画関数
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
  ctx.rect(x, y, 80, 50);
  ctx.stroke();
  x = canvas.width / 2;
  y = canvas.height - 75;
  ctx.textAlign = "center";
  ctx.font = "20px 'MS P Gothic'";
  ctx.fillText("Push!!", x, y);
  ctx.closePath();
}

let isMouseDown = false;

//マウスのクリック検知関数
function onMouseDown() {
  isMouseDown = true;
}

//マウスのクリック検知関数
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

//マウスの座標をとる関数
function getMousePosition(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return [evt.clientX - rect.left, evt.clientY - rect.top];
}

let metarNum = 0;
const metarMaxNum = 10;
const velcVar = 12.5;
let metarVelc = velcVar;

//AAを打ち出す関数
function AAShoot() {
  vx_m = metarNum * 20 * Math.cos(angle - Math.PI / 2);
  vy_m = metarNum * 20 * Math.sin(angle - Math.PI / 2);
}

//ボタンの処理
function buttonPush() {
  if (isMetarEnable) {
    isMetarEnable = false;
    isArrow = true;
  } else {
    isArrow = false;
    isButtonEnable = false;
    AAShoot();
  }
}
const powerImg = new Image();
powerImg.addEventListener("load", () => {
});
powerImg.src = "power.png";

let x_m = 200;
let y_m = 200;
let vx_m = 0;
let vy_m = 0;
let size_m = 75;

//メーター描画用関数
function drawMeter() {
  const x = x_m + canvas.width / 5;
  const y = canvas.height - 150;
  const w = canvas.height / 5;
  const h = canvas.height / 3;

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
    y - h,
  );

  gradient2.addColorStop(0, "#acad3fff");
  gradient2.addColorStop(0.4, "#ffd556ff");
  gradient2.addColorStop(0.7, "#fc260eff");
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
    x - w / scale + 10,
    y - w / 1,
    w * 2 / scale,
    w * 2 / scale,
  );
  ctx.closePath();

  metarNum += metarVelc * deltaTime;
  metarNum %= metarMaxNum;
}

let isArrow = false;

const arrowImg = new Image();
arrowImg.addEventListener("load", () => {
});
arrowImg.src = "arrow.png";

let angle = 0;
const angleVelc = Math.PI * 1.5;
let sizeAngle = 0;
let sizex = 1;
let sizey = 1;

//やじるし描画用関数
function drawArrow() {
  ctx.beginPath();
  ctx.save();
  ctx.translate(x_m, y_m);
  ctx.rotate(angle);
  sizey = 100 + 15 * Math.sin(sizeAngle);
  sizex = 100;
  ctx.drawImage(arrowImg, -sizex / 2, -sizey - size_m, sizex, sizey);
  ctx.restore();
  ctx.closePath();
  sizeAngle -= angleVelc * 3.25 * deltaTime;
  angle -= angleVelc * deltaTime;
  if (angle < 0) angle += Math.PI * 2;
  if (sizeAngle < 0) sizeAngle += Math.PI * 2;
}

//AA描画用関数(今は円だけ)
function drawMyAA() {
  ctx.beginPath();
  ctx.arc(x_m, y_m, size_m, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.closePath();
}

function testDraw() {
  ctx.textAlign = "left";
  ctx.fillStyle = "#000000";
  ctx.fillText("power:" + (Math.floor(metarNum * 10) / 10), 100, 100);
  ctx.fillText("angle:" + (Math.floor(angle * 10) / 10), 100, 60);
  ctx.fillText("deltaTime:" + deltaTime, 100, 20);
  ctx.fillText("firstTime:" + firstTimestamp, 100, 140);
}

function AAMove() {
  x_m += vx_m * deltaTime;
  y_m += vy_m * deltaTime;
}

let deltaTime = 0;

let lastTimestamp = null;

let firstTimestamp;

//FPS管理
function fpsUpdate(timestamp) {
  deltaTime = 0; // 前回フレーム時間からの経過時間(単位:秒)
  if (lastTimestamp != null) {
    deltaTime = (timestamp - lastTimestamp) / 1000; // ミリ秒を1000で割ると秒になる(1000ミリ秒÷1000は1秒)
  } else {
    firstTimestamp = timestamp;
  }
  lastTimestamp = timestamp;
}

//メインの描画関数
function draw(timestamp) {
  fpsUpdate(timestamp);
  AAMove();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMyAA();
  if (isButtonEnable) drawButton();
  if (isMetarEnable) drawMeter();
  if (isArrow) drawArrow();
  testDraw();
  window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);
