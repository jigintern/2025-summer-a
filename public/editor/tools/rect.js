import { CharPlace } from "./util.js";
import { line } from "./line.js";

/**
 * AAに矩形を描く
 * @param {string} aa AAの文字列データ
 * @param {number} width AAの最大幅(px)
 * @param {number} height AAの最大行数
 * @param {number} x 矩形の左
 * @param {number} y 矩形の上
 * @param {number} w 矩形の幅
 * @param {number} h 矩形の高さ
 */
export const rect = (aa, width, height, x, y, w, h) => {
  aa = line(aa, width, height, [x, y], [x + w, y]);
  aa = line(aa, width, height, [x + w, y], [x + w, y + h]);
  aa = line(aa, width, height, [x + w, y + h], [x, y + h]);
  aa = line(aa, width, height, [x, y + h], [x, y]);
  const cp = new CharPlace(aa, width, height);
  return cp.toAA();
};
