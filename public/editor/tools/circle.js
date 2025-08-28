import { CharPlace } from "./util.js";
import { line } from "./line.js";
import charwidth from "../../util/charwidth.json" with { type: "json" };
window.charwidth = charwidth;

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
  if (r === 18) {
    const cp = new CharPlace(aa, width, height);
    cp.addChar(top, cx - 18, "₍");
    cp.addChar(top, cx - 15, "ˑ");
    cp.addChar(top, cx - 8, "⌒");
    cp.addChar(top, cx + 11, "ˑ");
    cp.addChar(top, cx + 15, "₎");
    cp.addChar(top + 1, cx - 17, "∖");
    cp.addChar(top + 1, cx - 6, "‿");
    cp.addChar(top + 1, cx + 9, "ɹ");
    cp.addChar(top + 1, cx + 15, "'");

    return cp.toAA();
  } else if (r === 27) {
    const cp = new CharPlace(aa, width, height);
    cp.addChar(top, cx - 23, "ˌ");
    cp.addChar(top, cx - 19, "‛");
    cp.addChar(top, cx - 14, "´");
    cp.addChar(top, cx - 5, "¯");
    cp.addChar(top, cx + 7, "`");
    cp.addChar(top, cx + 16, "‛");
    cp.addChar(top, cx + 20, "ˌ");
    cp.addChar(top + 1, cx - 26, "|");
    cp.addChar(top + 1, cx + 23, "|");
    cp.addChar(top + 2, cx - 24, "ˈ");
    cp.addChar(top + 2, cx - 20, "·");
    cp.addChar(top + 2, cx - 12, "¸");
    cp.addChar(top + 2, cx - 5, "_");
    cp.addChar(top + 2, cx, "_");
    cp.addChar(top + 2, cx + 10, ",");
    cp.addChar(top + 2, cx + 17, "·");
    cp.addChar(top + 2, cx + 20, "ˈ");

    return cp.toAA();
  } else {
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
    const cp = new CharPlace(aa, width, height);

    const count = Math.round(Math.sqrt(r ** 2 - (r - 18) ** 2) / 8);
    const l = cx - count * 8;
    const lowL = Math.round(
      (cx - Math.sqrt(r ** 2 - (r - 13.5) ** 2) - l) / 16,
    );
    const midL = Math.round((cx - Math.sqrt(r ** 2 - (r - 4.5) ** 2) - l) / 16);
    const high = Math.round((cx + Math.sqrt(r ** 2 - (r - 4.5) ** 2) - l) / 16);
    const midR = Math.round(
      (cx + Math.sqrt(r ** 2 - (r - 13.5) ** 2) - l) / 16,
    );
    for (let i = 0; i < lowL; ++i) {
      cp.addChar(top, l + i * 16, "＿");
      cp.addChar(bottom - 1, l + i * 16, "￣");
    }
    for (let i = lowL; i < midL; ++i) {
      cp.addChar(top, l + i * 16, "─");
      cp.addChar(bottom - 1, l + i * 16, "─");
    }
    for (let i = midL; i < high; ++i) {
      cp.addChar(top, l + i * 16, "￣");
      cp.addChar(bottom - 1, l + i * 16, "＿");
    }
    for (let i = high; i < midR; ++i) {
      cp.addChar(top, l + i * 16, "─");
      cp.addChar(bottom - 1, l + i * 16, "─");
    }
    for (let i = midR; i < count; ++i) {
      cp.addChar(top, l + i * 16, "＿");
      cp.addChar(bottom - 1, l + i * 16, "￣");
    }

    return cp.toAA();
  }
};
