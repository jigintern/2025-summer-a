import { CharPlace } from "./util.js";
import charwidth from "../../util/charwidth.json" with { type: "json" };

/**
 * AAに直線を引く
 * @param {string} aa AAの文字列データ
 * @param {number} width AAの最大幅(px)
 * @param {number} height AAの最大行数
 * @param {[number, number]} start 直線の開始地点の`[行, 左端からの位置(px)]`
 * @param {[number, number]} stop 直線の終了地点の`[行, 左端からの位置(px)]`
 */
export const line = (aa, width, height, start, stop) => {
  const cp = new CharPlace(aa, width, height);
  if (stop[0] < start[0]) [start, stop] = [stop, start];
  const dy = stop[0] - start[0];
  const dx = stop[1] - start[1];
  if (dy === 0) {
    // 横線
  } else {
    for (let i = start[0]; i < stop[0]; ++i) {
      const x1 = Math.round(((i - start[0]) / dy) * dx + start[1]);
      const x2 = Math.round(((i + 1 - start[0]) / dy) * dx + start[1]);
      const lwidth = x2 - x1;
      if (5 <= lwidth && lwidth <= 13) {
        // 罫線 (幅11)
        cp.addChar(i, Math.round((x1 + x2) / 2 - 8), "＼");
      } else if (5 <= lwidth && lwidth <= 13) {
        // 罫線 (幅11)
        cp.addChar(i, Math.round((x1 + x2) / 2 - 5.5), "╲");
      } else if (-3 <= lwidth && lwidth <= 5) {
        // ほぼまっすぐなのでパイプ
        cp.addChar(i, Math.round((x1 + x2) / 2 - 2), "|");
      } else if (-9 <= lwidth && lwidth <= -4) {
        // スラッシュ (幅8)
        cp.addChar(i, Math.round((x1 + x2) / 2 - 4), "/");
      } else if (-13 <= lwidth && lwidth <= -10) {
        // 罫線 (幅11)
        cp.addChar(i, Math.round((x1 + x2) / 2 - 5.5), "╱");
      } else if (lwidth <= -14) {
        // 全角スラッシュ (幅16)
        cp.addChar(i, Math.round((x1 + x2) / 2 - 8), "／");
      }
    }
  }
  return cp.toAA();
};
