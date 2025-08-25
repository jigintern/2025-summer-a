// ブラウザで実行してください

import ranges from "./mspgothic_supported.json" with { type: "json" };

// 文字の大きさを測るCanvasの用意
const canvas = new OffscreenCanvas(1, 1);
const ctx = canvas.getContext("2d");
ctx.font = '12pt "MS PGothic"';

// 文字 → MS PGothic 12ptでの幅の変換
const getWidth = (c) => ctx.measureText(c).width;

// 出力するJSONのオブジェクト
const obj = {};

const addChar = (c) => {
  const width = getWidth(c);
  if (width !== 0 && Number.isInteger(width)) obj[c] = width;
};

// ASCIIの印字可能文字の範囲を走査
for (const range of ranges) {
  if (typeof range === "number") {
    addChar(String.fromCharCode(range));
  }
  for (let i = range[0]; i <= range[1]; ++i) {
    addChar(String.fromCharCode(i));
  }
}
// 出力
// ノーブレークスペース(U+00A0)が出力時とかコピペ時に半角スペース(U+0020)に置き換わるので, 手動でエスケープ等を入れて下さい
console.log(JSON.stringify(obj));
