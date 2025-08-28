import { CharPlace } from "./util.js";
import { line } from "./line.js";

/**
 * AAに円を描く
 * @param {string} aa AAの文字列データ
 * @param {number} width AAの最大幅(px)
 * @param {number} height AAの最大行数
 * @param {number} cx 円の中心の左端からの位置(px)
 * @param {number} top 円の上端の行
 * @param {number} bottom 円の下端の行
 */
export const circle = (aa, width, height, cx, top, bottom) => {
  if (bottom - top === 1) {
    const cp = new CharPlace(aa, width, height);
    cp.addChar(top, cx - 8, "◯");
    return cp.toAA();
  }
  const r = (bottom - top) * 9;
  const cy = (top + bottom) / 2;
  for (let i = top + 1; i < bottom - 1; ++i) {
    aa = line(
      aa,
      width,
      height,
      [i, cx + Math.sqrt(r ** 2 - ((cy - i) * 18) ** 2)],
      [i + 1, cx + Math.sqrt(r ** 2 - ((cy - i - 1) * 18) ** 2)],
    );
    aa = line(
      aa,
      width,
      height,
      [i, cx - Math.sqrt(r ** 2 - ((cy - i) * 18) ** 2)],
      [i + 1, cx - Math.sqrt(r ** 2 - ((cy - i - 1) * 18) ** 2)],
    );
  }
  return aa;
};
