import { AAObj, BattleStatus } from "./physics.js";

const canvas = document.getElementById("battle_canvas");

canvas.width = 1000;
canvas.height = 500;
let aspect = 1;

const ctx = canvas.getContext("2d");

//ウィンドウサイズが変わった時の処理
function setDispSize() {
  const area = document.getElementById("window_main");
  console.log(area.clientWidth);
  console.log(area.clientHeight);
  if (area.clientHeight * 1000 > area.clientWidth * 500) {
    aspect = area.clientWidth / canvas.width;
    canvas.style.width = area.clientWidth + "px";
    canvas.style.height = (area.clientWidth * 500 / 1000) + "px";
  } else {
    aspect = area.clientHeight / canvas.height;
    canvas.style.width = (area.clientHeight * 1000 / 500) + "px";
    canvas.style.height = area.clientHeight + "px";
  }
  console.log("x:" + canvas.width);
  console.log("y:" + canvas.height);
}

setDispSize();

window.addEventListener("resize", setDispSize);

const bs = new BattleStatus(
  new AAObj(50, [80, 180], [0, 0], 0, 0),
  new AAObj(60, [400, 180], [0, 0], 0, 0),
);

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
  if (aspect === 0) {
    mouseX = -1000;
    mouseY = -1000;
  } else {
    mouseX = mousePos[0] / aspect;
    mouseY = mousePos[1] / aspect;
  }
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
  bs.a.dx[0] = metarNum * 0.5 * Math.cos(angle - Math.PI / 2);
  bs.a.dx[1] = metarNum * 0.5 * Math.sin(angle - Math.PI / 2);
  bs.a.dtt = metarNum * 0.1 * (Math.random() - 0.5);
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

//メーター描画用関数
function drawMeter() {
  const x = bs.a.x[0] + canvas.width / 5;
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

  const gradient2 = ctx.createLinearGradient(
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
  ctx.translate(bs.a.x[0], bs.a.x[1]);
  ctx.rotate(angle);
  sizey = 100 + 15 * Math.sin(sizeAngle);
  sizex = 100;
  ctx.drawImage(arrowImg, -sizex / 2, -sizey - bs.a.r, sizex, sizey);
  ctx.restore();
  ctx.closePath();
  sizeAngle -= angleVelc * 3.25 * deltaTime;
  angle -= angleVelc * deltaTime;
  if (angle < 0) angle += Math.PI * 2;
  if (sizeAngle < 0) sizeAngle += Math.PI * 2;
}

const playerImgA = new Image();
playerImgA.addEventListener("load", () => {
});
playerImgA.src = "power.png";

const playerImgB = new Image();
playerImgB.addEventListener("load", () => {
});
playerImgB.src = "power.png";

//AA描画用関数(今は円だけ)
function drawMyAA() {
  ctx.beginPath();
  ctx.save();
  ctx.translate(bs.a.x[0], bs.a.x[1]);
  ctx.rotate(bs.a.tt);
  ctx.drawImage(
    playerImgA,
    -bs.a.r * Math.sqrt(2) / 2,
    -bs.a.r * Math.sqrt(2) / 2,
    bs.a.r * Math.sqrt(2),
    bs.a.r * Math.sqrt(2),
  );
  ctx.restore();
  ctx.closePath();

  ctx.beginPath();
  ctx.save();
  ctx.translate(bs.b.x[0], bs.b.x[1]);
  ctx.rotate(bs.b.tt);
  ctx.drawImage(
    playerImgA,
    -bs.b.r * Math.sqrt(2) / 2,
    -bs.b.r * Math.sqrt(2) / 2,
    bs.b.r * Math.sqrt(2),
    bs.b.r * Math.sqrt(2),
  );
  ctx.restore();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(bs.a.x[0], bs.a.x[1], bs.a.r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(bs.a.x[0], bs.a.x[1], bs.a.r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(bs.b.x[0], bs.b.x[1], bs.b.r, 0, 2 * Math.PI);
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
  bs.nextTick();
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
let textarea = null;

canvas.addEventListener("onclick", function (e) {
  if (!textarea) {
    textarea = document.createElement("textarea");
    textarea.className = "info";
    document.body.appendChild(textarea);
  }
  var x = e.clientX - canvas.offsetLeft,
    y = e.clientY - canvas.offsetTop;
  console.log("asasasasasasasasas" + x);
  textarea.value = "x: " + x + " y: " + y;
  textarea.style.top = e.clientY + "px";
  textarea.style.left = e.clientX + "px";
}, false);

function checkDeath() {
}

function gameFlow() {
  AAMove();
  checkDeath();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMyAA();
  if (isButtonEnable) drawButton();
  if (isMetarEnable) drawMeter();
  if (isArrow) drawArrow();
  //testDraw();
}

function userInputRect() {
  ctx.beginPath();
  ctx.closePath();
}

function roomSearch() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawUserInputRect();
}

function gameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let isRoomSearch = true;

let isGameTime = true;

let isGameOver = true;

//メインの描画関数
function draw(timestamp) {
  fpsUpdate(timestamp);
  if (isRoomSearch) {
    roomSearch();
  } else if (isGameTime) {
    gameFlow();
  } else if (isGameOver) {
    gameOver();
  }
  window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);
