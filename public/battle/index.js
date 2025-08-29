import { AAObj, BattleStatus } from "./physics.js";

import { GameStatus } from "./game-common.js";

import { aa2blob } from "../util/aa2img.js";

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

const gs = new GameStatus();

gs.turn = "A";
gs.a = bs.a;
gs.b = bs.b;

const gs_a = new GameStatus();

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
  if (isMouseOverGoHome) window.location.href = `../`;
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

const maxPower = 1;
const maxDtt = 1;

//AAを打ち出す関数
function AAShoot() {
  gs.addAccel(
    angle,
    maxPower * metarNum / metarMaxNum,
    metarNum / metarMaxNum * maxDtt * (Math.random() - 0.5) * 2,
  );

  if (mySign === "A") {
    bs.a = gs.field.a;
  } else {
    bs.a = gs.field.b;
  }
  ws.send(JSON.stringify({
    type: "attack",
    direction: angle - Math.PI / 2,
    power: maxPower * metarNum / metarMaxNum,
    dtt: bs.a.dtt,
  }));
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

const myAA = new URL(decodeURIComponent(document.location.href)).searchParams
  .get("id");

let enemyAA;

const playerImgA = new Image();
const playerImgB = new Image();
let AATitle;
let AATitle_e;

playerImgA.src = "";
if (myAA) {
  fetch(`/AALibrary/${encodeURIComponent(myAA)}`)
    .then((r) => r.json())
    .then((aainfo) => {
      AATitle = aainfo.title;
      aa2blob(aainfo.content).then((url) => {
        playerImgA.src = url;
      });
    })
    .catch(() => {
      alert("AAの読み込みに失敗しました");
      aa2blob("error...\n[悲報]エラー").then((url) => {
        playerImgA.src = url;
      });
    });
}

//AA描画用関数(今は円だけ)
function drawMyAA() {
  ctx.beginPath();
  ctx.save();
  ctx.translate(bs.a.x[0], bs.a.x[1]);
  ctx.rotate(bs.a.tt);
  let w = playerImgA.width;
  let h = playerImgA.height;
  let a = 2 * gs.field.a.r / Math.hypot(w, h);

  ctx.drawImage(
    playerImgA,
    -a * w / 2,
    -a * h / 2,
    a * w,
    a * h,
  );

  ctx.restore();
  ctx.closePath();

  ctx.beginPath();
  ctx.save();
  ctx.translate(bs.b.x[0], bs.b.x[1]);
  ctx.rotate(bs.b.tt);
  w = playerImgB.width;
  h = playerImgB.height;
  a = 2 * gs.field.b.r / Math.hypot(w, h);

  ctx.drawImage(
    playerImgB,
    -a * w / 2,
    -a * h / 2,
    a * w,
    a * h,
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
      conflictAngle - 1.5 * conflictEffectTime - (mySign !== "A" ? Math.PI : 0),
      conflictAngle + 1.5 * conflictEffectTime - (mySign !== "A" ? Math.PI : 0),
    );
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(
      bs.b.x[0],
      bs.b.x[1],
      bs.b.r,
      conflictAngle - 1.5 * conflictEffectTime - (mySign === "A" ? Math.PI : 0),
      conflictAngle + 1.5 * conflictEffectTime - (mySign === "A" ? Math.PI : 0),
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
  if (mySign === "A") {
    gs.field = bs;
  } else {
    gs.field.b = bs.a;
    gs.field.a = bs.b;
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

function setDeath(x, y, angle, size, player) {
  console.log(angle);
  console.log(angle);
  deathX = x;
  deathY = y;
  deathAngle = angle;
  deathSize = size * 0.75;
  deathAnimTime = 0;
  deathPlayer = player;
  isGameTime = false;
  isGameOver = true;
}

function checkDeath() {
  const death = [];
  if (!gs.field.a.isInField()) death.push("A");
  if (!gs.field.b.isInField()) death.push("B");
  if (death.length === 0) {
    console.log("error");
    return;
  }
  if (death[0] === mySign) {
    setDeath(
      bs.a.x[0],
      bs.a.x[1],
      Math.atan2(bs.a.dx[1], bs.a.dx[0]),
      bs.a.r,
      0,
    );
  } else {
    setDeath(
      bs.b.x[0],
      bs.b.x[1],
      Math.atan2(bs.b.dx[1], bs.b.dx[0]),
      bs.b.r,
      1,
    );
  }
}

function gameFlow() {
  AAMove();
  checkDeath();

  drawBackground();

  drawMyAA();
  if (isButtonEnable) drawButton();
  if (isMetarEnable) drawMeter();
  if (isArrow) drawArrow();
  checkTurnEnd();

  //testDraw();
}

let isMoving = false;

function checkTurnEnd() {
  if (gs.isTurnFinished() && isMoving) {
    if (isWaitTurn) {
      myTurn();
    } else {
      waitTurn();
    }

    gs.updateFromJSON(gs_a.getJson());
    if (mySign === "A") {
      bs.a = gs.field.a;
      bs.b = gs.field.b;
    } else {
      bs.a = gs.field.b;
      bs.b = gs.field.a;
    }
    checkDeath();
  }
  isMoving = !gs.isTurnFinished();
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
  const h2 = canvas.height / 12.5;
  let animNum = 2 * (waitTime % 3) / 3;

  const sundStyle = "rgba(255, 255, 255, 1)";
  const glassStyle = "rgba(143, 143, 143, 1)";
  const blockStyle = "rgba(49, 49, 49, 1)";
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
  ctx.strokeStyle = blockStyle;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-w / 2, +h / 2);
  ctx.lineTo(w / 2, +h / 2);
  ctx.lineTo(0, 0);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(-w / 2, +h / 2);
  ctx.lineTo(-w / 2, +h / 2 + h2);
  ctx.lineTo(w / 2, +h / 2 + h2);
  ctx.lineTo(w / 2, +h / 2);
  ctx.fillStyle = blockStyle;
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(-w / 2, +h / 2);
  ctx.lineTo(-w / 2, +h / 2 + h2);
  ctx.lineTo(w / 2, +h / 2 + h2);
  ctx.lineTo(w / 2, +h / 2);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(-w / 2, -h / 2 - h2);
  ctx.lineTo(w / 2, -h / 2 - h2);
  ctx.lineTo(w / 2, -h / 2);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(-w / 2, -h / 2 - h2);
  ctx.lineTo(w / 2, -h / 2 - h2);
  ctx.lineTo(w / 2, -h / 2);
  ctx.stroke();
  ctx.closePath();

  ctx.restore();
}

function waitingAnim() {
  waitingText();
  hourglass();
  waitTime += deltaTime;
}

let isRoomInEnable = true;
let roomWord = "";

function roomInButtonPush() {
  const roomInput = document.getElementById("room_word");
  roomWord = roomInput.value;
  if (roomWord === "") return;
  console.log(window.location.protocol);
  if (window.location.protocol === "https:") {
    ws = new WebSocket(
      `wss://${location.host}/ws/battle?id=${myAA}&room=${roomWord}`,
    );
  } else {
    ws = new WebSocket(
      `ws://${location.host}/ws/battle?id=${myAA}&room=${roomWord}`,
    );
  }
  console.log(ws);

  ws.onmessage = (event) => {
    getMessage(event);
  };

  ws.onopen = (event) => {
    getOpen(event);
  };

  ws.onerror = (error) => {
    getError(error);
  };

  ws.onclose = (event) => {
    getClose(event);
  };

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
  drawUserInputRect();
}

let deathX = 0;
let deathY = 250;
let deathAngle = 0;
let deathSize = 20;
let deathAnimTime = 0;
let deathPlayer = 0;
const deathColor = [[
  "#5bffcea3",
  "#6dffd3b2",
  "#94ffdf1a",
], [
  "#ff5b5ba3",
  "#ff6d6db2",
  "#ff94941a",
]];

function drawGameOver() {
  const animNum = deathAnimTime > 0.5 ? 1 : deathAnimTime / 0.5;
  const animNum2 = Math.log2(animNum * 31 + 1) / 5;
  const animClock = Math.PI * 2 * deathAnimTime * 5;

  ctx.save();
  ctx.translate(deathX, deathY);
  ctx.rotate(deathAngle);

  ctx.beginPath();
  ctx.filter = "blur(8px)";
  ctx.ellipse(
    0,
    0,
    canvas.height / 1.5 * animNum2 + Math.sin(animClock) * 20,
    deathSize * animNum,
    0,
    0,
    Math.PI * 2,
  );

  ctx.fillStyle = deathColor[deathPlayer][0];
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.filter = "blur(4px)";
  ctx.globalCompositeOperation = "lighter";

  makeEllipse(
    0,
    canvas.height / 2 * animNum2 + Math.sin(animClock) * 10,
    deathSize * animNum * 0.35,
  );

  makeEllipse(
    deathSize / 2.45 * animNum,
    canvas.height / 2.3 * animNum2 + Math.sin(animClock * 1.2) * 20,
    deathSize * animNum * 0.095,
  );

  makeEllipse(
    -deathSize / 2.4 * animNum,
    canvas.height / 2.5 * animNum2 + Math.sin(animClock * 1.2) * 20,
    deathSize * animNum * 0.095,
  );

  makeEllipse(
    0,
    canvas.height / 1.8 * animNum2 + Math.sin(animClock * 1.2) * 20,
    deathSize * animNum * 0.25,
  );

  makeEllipse(
    0,
    canvas.height / 1.5 * animNum2 + Math.sin(animClock * 1.2) * 20,
    deathSize * animNum * 0.1,
  );

  ctx.fillStyle = deathColor[deathPlayer][1];
  ctx.fill();
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.filter = "blur(24px)";

  makeEllipse(
    0,
    canvas.height / 2 * animNum2 + Math.sin(animClock) * 10,
    deathSize * animNum * 0.3,
  );

  makeEllipse(
    deathSize / 2.45 * animNum,
    canvas.height / 2.3 * animNum2 + Math.sin(animClock * 1.2) * 20,
    deathSize * animNum * 0.095,
  );

  makeEllipse(
    -deathSize / 2.4 * animNum,
    canvas.height / 2.5 * animNum2 + Math.sin(animClock * 1.2) * 20,
    deathSize * animNum * 0.095,
  );

  makeEllipse(
    0,
    canvas.height / 1.5 * animNum2 + Math.sin(animClock * 1.2) * 20,
    deathSize * animNum * 0.01,
  );

  ctx.fillStyle = deathColor[deathPlayer][2];
  ctx.fill();
  ctx.fill();

  ctx.closePath();

  ctx.restore();

  deathAnimTime += deltaTime;
}

function makeEllipse(x, h, w) {
  ctx.ellipse(
    0,
    x,
    h,
    w,
    0,
    0,
    Math.PI * 2,
  );
}

const loserImg = new Image();
loserImg.addEventListener("load", () => {
});
loserImg.src = "./images/you_are_lose.png";

const winnerImg = new Image();
winnerImg.addEventListener("load", () => {
});
winnerImg.src = "./images/you_are_win.png";

function result() {
  let img;
  if (deathPlayer === 0) {
    img = loserImg;
  } else {
    img = winnerImg;
  }

  const x = canvas.width / 2;
  const y = canvas.height / 2;
  const aspect = img.height / img.width;
  const w = canvas.width * 0.6;
  const h = w * aspect;

  ctx.save();

  ctx.filter = "blur(4px) invert(100%)";
  ctx.drawImage(img, x - w / 2, y - h / 2, w, h);

  ctx.restore();

  ctx.save();

  ctx.drawImage(img, x - w / 2, y - h / 2, w, h);

  ctx.restore();
}

let isMouseOverGoHome = false;

function goHomeButton() {
  let x, y, w, h, alt;
  ctx.save();
  ctx.beginPath();
  ctx.filter = "blur(4px)";
  x = canvas.width / 2;
  y = canvas.height * 0.8;
  w = canvas.width / 5;
  h = canvas.height * 0.1;
  ctx.strokeStyle = "#0a3cd1ff";
  createRoundRectPath(x - w / 2, y - h / 2, w, h, 5);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.filter = "none";
  createRoundRectPath(x - w / 2, y - h / 2, w, h, 5);
  ctx.fillStyle = "#fefefeff";
  isMouseOverGoHome = false;
  if (mouseX < x + w / 2 && mouseX > x - w / 2) {
    if (mouseY < y + h / 2 && mouseY > y - h / 2) {
      isMouseOverGoHome = true;
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
  createRoundRectPath(x - w / 2, y - h / 2, w, h, 5);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.fillStyle = "#000000ff";
  ctx.textAlign = "center";
  ctx.font = "20px 'MS UI Gothic'";
  ctx.fillText("ホームに戻る", x, y);
  ctx.closePath();

  ctx.beginPath();
  ctx.filter = "blur(10px)";
  if (alt) y = bs.a.x[1] - bs.a.r - 50;
  ctx.strokeStyle = "#54ddf9e1";
  createRoundRectPath(x - w / 2, y - h / 2, w, h, 5);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

function gameOver() {
  drawBackground();
  drawMyAA();
  drawGameOver();
  result();
  goHomeButton();
}

let isRoomSearch = true;

let isWaiting = true;

let isGameTime = true;

let isGameOver = true;

function resetStyle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.filter = "none";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000000";
}

const backgroundImg = new Image();
backgroundImg.addEventListener("load", () => {
});
backgroundImg.src = "./images/battle_frame.png";

function drawBackground() {
  ctx.beginPath();
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
  ctx.closePath();
}

let ws;
let mySign = "";

function getMessage(event) {
  console.log("メッセージ");
  console.log(event);

  const msg = JSON.parse(event.data);

  switch (msg.type) {
    case "init":
      isWaiting = false;
      isGameTime = true;
      mySign = msg.sign;
      gs.turn = msg.sign;
      console.log(msg.field);
      gs.updateFromJSON(msg.field);

      enemyAA = msg.aaId;
      playerImgB.src = "";
      if (enemyAA || true) {
        fetch(`/AALibrary/${encodeURIComponent(enemyAA)}`)
          .then((r) => r.json())
          .then((aainfo) => {
            AATitle_e = aainfo.title;
            aa2blob(aainfo.content).then((url) => {
              playerImgB.src = url;
            });
          })
          .catch(() => {
            alert("AAの読み込みに失敗しました");
            aa2blob("error...\n[悲報]エラー").then((url) => {
              playerImgB.src = url;
            });
          });
      }

      if (mySign === "A") {
        bs.a = gs.field.a;
        bs.b = gs.field.b;
        myTurn();
      } else {
        bs.a = gs.field.b;
        bs.b = gs.field.a;
        waitTurn();
      }
      break;
    case "turn":
      gs_a.updateFromJSON(msg.afterField);

      gs.updateFromJSON(msg.beforeField);
      break;
  }
}

let isWaitTurn = false;

function myTurn() {
  console.log("myTurn");
  isWaitTurn = false;
  isMetarEnable = true;
  isButtonEnable = true;
  isArrow = false;
}

function waitTurn() {
  console.log("waiting");
  isWaitTurn = true;
  isMetarEnable = false;
  isButtonEnable = false;
  isArrow = false;
}

function getOpen(event) {
  console.log("通信接続イベント受信");
  console.log(event);
}

function getError(error) {
  console.log("エラー発生");
  console.log(error);
}

function getClose(event) {
  console.log("通信切断イベント受信");
  console.log(event);
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
