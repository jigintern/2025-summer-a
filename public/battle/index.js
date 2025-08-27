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
  console.log("x:" + canvas.style.width);
  console.log("y:" + canvas.style.height);
}

setDispSize();

window.addEventListener("resize", setDispSize);

const bs = new BattleStatus(
  new AAObj(50, [250, 250], [0, 0], 0, 0),
  new AAObj(50, [750, 250], [0, 0], 0, 0),
);

let mouseX = 0;
let mouseY = 0;

let isMouseOverBt = false;

let isButtonEnable = true;
let isMetarEnable = true;

//ボタンの描画関数
function drawButton() {
  let x, y, alt;
  ctx.beginPath();
  ctx.filter = "blur(4px)";
  x = bs.a.x[0] - 40;
  y = bs.a.x[1] + bs.a.r + 10;
  alt = y > 400;
  if (alt) y = bs.a.x[1] - bs.a.r - 75;
  ctx.strokeStyle = "#0a3cd1ff";
  createRoundRectPath(x, y, 80, 50, 5);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.filter = "none";
  createRoundRectPath(x, y, 80, 50, 5);
  ctx.fillStyle = "#fefefeff";
  isMouseOverBt = false;
  if (mouseX < x + 80 && mouseX > x) {
    if (mouseY < y + 50 && mouseY > y) {
      isMouseOverBt = true;
      if (isMouseDown) {
        ctx.fillStyle = "#8edbffff";
      } else {
        ctx.fillStyle = "#caedffff";
      }
    }
  }
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#0a3cd1ff";
  createRoundRectPath(x, y, 80, 50, 5);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.fillStyle = "#000000ff";
  x += 40;
  y += 25;
  ctx.textAlign = "center";
  ctx.font = "20px 'MS UI Gothic'";
  ctx.fillText("Push!!", x, y);
  ctx.closePath();

  ctx.beginPath();
  ctx.filter = "blur(10px)";
  x = bs.a.x[0] - 40;
  y = bs.a.x[1] + 75;
  if (alt) y = bs.a.x[1] - bs.a.r - 50;
  ctx.strokeStyle = "#54ddf9e1";
  createRoundRectPath(x, y, 80, 50, 5);
  ctx.stroke();
  ctx.filter = "none";
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
  if (isMouseOverBt && isButtonEnable) buttonPush();
  if (isMouseOverUserBt && isRoomInEnable) roomInButtonPush();
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
const metarVelc = 12.5;

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
  let x = bs.a.x[0] + canvas.width / 5;
  if (x > 800) x = bs.a.x[0] - canvas.width / 5;
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

  gradient2.addColorStop(0, "#6dff8dff");
  gradient2.addColorStop(0.4, "#dfff87ff");
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
  sizey = 10 * (1 + metarNum) * (1 + 0.1 * Math.sin(sizeAngle));
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
  ctx.arc(bs.b.x[0], bs.b.x[1], bs.b.r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.closePath();

  if (isConflict) {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ff0000ff";
    ctx.arc(
      bs.a.x[0],
      bs.a.x[1],
      bs.a.r,
      conflictAngle - 1.5 * conflictEffectTime,
      conflictAngle + 1.5 * conflictEffectTime,
    );
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(
      bs.b.x[0],
      bs.b.x[1],
      bs.b.r,
      conflictAngle - 1.5 * conflictEffectTime - Math.PI,
      conflictAngle + 1.5 * conflictEffectTime - Math.PI,
    );
    ctx.stroke();
    ctx.closePath();
    conflictEffectTime -= deltaTime;
    if (conflictEffectTime < 0) {
      conflictEffectTime = 0;
      isConflict = false;
    }
  }
}

function testDraw() {
  ctx.textAlign = "left";
  ctx.fillStyle = "#000000";
  ctx.fillText("power:" + (Math.floor(metarNum * 10) / 10), 100, 100);
  ctx.fillText("angle:" + (Math.floor(angle * 10) / 10), 100, 60);
  ctx.fillText("deltaTime:" + deltaTime, 100, 20);
  ctx.fillText("firstTime:" + firstTimestamp, 100, 140);
}

let isConflict = false;
let conflictAngle = 0;
let conflictEffectTime = 0;

function AAMove() {
  if (bs.nextTick()) {
    isConflict = true;
    conflictAngle = Math.atan(
      (bs.a.x[1] - bs.b.x[1]) / (bs.a.x[0] - bs.b.x[0]),
    );
    conflictEffectTime = 0.5;
  }
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

function checkDeath() {
  if (bs.a.x[0] < -bs.a.r || bs.a.x[0] > 1000 + bs.a.r) console.log("death");
  else if (bs.a.x[1] < -bs.a.r || bs.a.x[1] > 500 + bs.a.r) {
    console.log("death");
  }
  if (bs.b.x[0] < -bs.b.r || bs.b.x[0] > 1000 + bs.b.r) console.log("death");
  else if (bs.b.x[1] < -bs.b.r || bs.b.x[1] > 500 + bs.b.r) {
    console.log("death");
  }
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

let waitTime = 0;

function waitingText() {
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000000";
  ctx.fillText(Math.floor(waitTime * 10) / 10, 100, 100);
  ctx.closePath();
}

function hourglass() {
  const x = canvas.width / 2;
  const y = canvas.height / 2;
  const w = canvas.width / 7;
  const h = canvas.height / 3;
  let animNum = 2 * (waitTime % 3) / 3;

  let sundStyle = "rgba(255, 255, 255, 1)";
  let glassStyle = "rgba(143, 143, 143, 1)";
  let angleStyle;

  ctx.save();
  ctx.translate(x, y);
  let animAngle = -1;
  if (animNum > 1) {
    if (animNum - 1 < 0.5) {
      animAngle = (1 - Math.cos((animNum - 1) * Math.PI / 2)) /
        (2 - Math.sqrt(2));
    } else {
      animAngle = 1 -
        (1 - Math.sin((animNum - 1) * Math.PI / 2)) / (2 - Math.sqrt(2));
    }
    ctx.rotate(animAngle * Math.PI);
    animNum = 1;
  }
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-w / 2, -h / 2);
  ctx.lineTo(w / 2, -h / 2);
  ctx.lineTo(0, 0);
  ctx.fillStyle = sundStyle;
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-w / 2, h / 2);
  ctx.lineTo(w / 2, h / 2);
  ctx.lineTo(0, 0);
  if (animAngle != -1) {
    angleStyle = "rgba(" + (143 + (255 - 143) * animAngle) + "," +
      (143 + (255 - 143) * animAngle) + "," + (143 + (255 - 143) * animAngle) +
      "," + 1 + ")";
  } else angleStyle = glassStyle;
  ctx.fillStyle = angleStyle;
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-w / 2 * (1 - animNum) / 2, -h / 2 * (1 - animNum) / 2);
  ctx.lineTo(w / 2 * (1 - animNum) / 2, -h / 2 * (1 - animNum) / 2);
  ctx.lineTo(0, 0);
  ctx.fillStyle = glassStyle;
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-w / 2 * (2 - animNum) / 2, h / 2 * (2 - animNum) / 2);
  ctx.lineTo(w / 2 * (2 - animNum) / 2, h / 2 * (2 - animNum) / 2);
  ctx.lineTo(0, 0);

  if (animAngle != -1) {
    angleStyle = "rgba(" + (255 - (255 - 143) * animAngle) + "," +
      (255 - (255 - 143) * animAngle) + "," + (255 - (255 - 143) * animAngle) +
      "," + 1 + ")";
  } else angleStyle = sundStyle;
  ctx.fillStyle = angleStyle;
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-w / 2, -h / 2);
  ctx.lineTo(w / 2, -h / 2);
  ctx.lineTo(0, 0);
  ctx.strokeStyle = "#585858ff";
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-w / 2, +h / 2);
  ctx.lineTo(w / 2, +h / 2);
  ctx.lineTo(0, 0);
  ctx.stroke();
  ctx.closePath();

  ctx.restore();
}

function waitingAnim() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  waitingText();
  hourglass();

  if (waitTime > 10) {
    console.log("test");
    isWaiting = false;
    isGameTime = true;
  }
  waitTime += deltaTime;
}

let isRoomInEnable = true;
let roomWord = "";

function roomInButtonPush() {
  const roomInput = document.getElementById("room_word");
  roomWord = roomInput.value;
  if (roomWord === "") return;
  isRoomInEnable = false;
  isRoomSearch = false;
  waitTime = 0;
  isWaiting = true;
  roomInput.style.display = "none";
}

let isMouseOverUserBt = false;

//あいことば入力画面の描画
function drawUserInputRect() {
  let x, y;
  ctx.beginPath();
  ctx.filter = "blur(4px)";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#3300ccff";
  x = canvas.width / 2 - 40;
  y = 2 * canvas.height / 3 - 25;
  createRoundRectPath(x, y, 80, 50, 5);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.filter = "none";
  createRoundRectPath(x, y, 80, 50, 5);
  ctx.fillStyle = "#fefefeff";
  isMouseOverUserBt = false;
  if (mouseX < canvas.width / 2 + 40 && mouseX > canvas.width / 2 - 40) {
    if (
      mouseY < 2 * canvas.height / 3 + 25 && mouseY > 2 * canvas.height / 3 - 25
    ) {
      isMouseOverUserBt = true;
      if (isMouseDown) {
        ctx.fillStyle = "#a1e1ffff";
      } else {
        ctx.fillStyle = "#9dfffaff";
      }
    }
  }
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "#180061ff";
  createRoundRectPath(x, y, 80, 50, 5);
  ctx.stroke();
  x = canvas.width / 2;
  y = 2 * canvas.height / 3;
  ctx.textAlign = "center";
  ctx.font = "20px 'MS UI Gothic'";
  ctx.fillText("入室!!", x, y);
  ctx.closePath();

  ctx.beginPath();
  ctx.filter = "blur(10px)";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#00a4dbc8";
  x = canvas.width / 2 - 40;
  y = 2 * canvas.height / 3 - 25;
  createRoundRectPath(x, y, 80, 50, 5);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.filter = "none";
  x = canvas.width / 2;
  y = canvas.height / 4;
  ctx.textAlign = "center";
  ctx.font = "20px 'MS UI Gothic'";
  ctx.fillText("あいことばを入力", x, y);
  ctx.closePath();
}

//角が丸い長方形の描画
function createRoundRectPath(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, Math.PI * (3 / 2), 0, false);
  ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * (1 / 2), false);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + h - r, r, Math.PI * (1 / 2), Math.PI, false);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, Math.PI * (3 / 2), false);
  ctx.closePath();
}

function roomSearch() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawUserInputRect();
}

let deathX = 0;
let deathY = 0;
let deathAngle = 0;
function drawGameOver() {
  ctx.save();

  

  ctx.restore();
}

function gameOver() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGameOver();
  drawMyAA();
}

let isRoomSearch = true;

let isWaiting = true;

let isGameTime = true;

let isGameOver = true;

function resetStyle() {
  ctx.filter = "none";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000000";
}

//メインの描画関数
function draw(timestamp) {
  fpsUpdate(timestamp);
  resetStyle();
  if (isRoomSearch) {
    roomSearch();
  } else if (isWaiting) {
    waitingAnim();
  } else if (isGameTime) {
    gameFlow();
  } else if (isGameOver) {
    gameOver();
  }
  window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);
