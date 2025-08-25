import { CharPlace } from "./util.js";

/**
 * AAの指定した位置の文字を削除する
 * @param {string} aa AAの文字列データ
 * @param {[number, number]} start 削除する地点の`[行, 左端からの位置(px)]`
 */
export const erase = (aa, width, height, start) => {
  const cp = new CharPlace(aa, width, height);
  cp.removeChar(...start);
  return cp.toAA();
};
