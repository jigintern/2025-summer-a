// ブラウザで実行してください

// 文字の大きさを測るCanvasの用意
const canvas = new OffscreenCanvas(1, 1);
const ctx = canvas.getContext("2d");
ctx.font = '12pt "MS PGothic"';

// 文字 → MS PGothic 12ptでの幅の変換
const getWidth = (c) => ctx.measureText(c).width;

// 出力するJSONのオブジェクト
const obj = {};
// ASCIIの印字可能文字の範囲を走査
for (let i = 0x20; i <= 0x7e; ++i) {
  const char = String.fromCharCode(i);
  obj[char] = getWidth(char);
}
// hair space (U+200A)
obj[" "] = getWidth(" ");
// 出力
console.log(JSON.stringify(obj));
