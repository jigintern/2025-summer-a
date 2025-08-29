import { CharPlace } from "../editor/tools/util.js";

/** @type {OffscreenCanvas} */
const canvas = new OffscreenCanvas(1, 1);
/** @type {OffscreenCanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

/**
 * @param {string} aa
 */
export const aa2blob = async (aa) => {
  const [top, right, bottom, left] = new CharPlace(aa, 1000, 720).getRect();
  canvas.width = right - left;
  canvas.height = (bottom - top) * 18;
  ctx.font = "12pt 'MS PGothic', 12pt 'Saitamaar'";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const saa = aa.split("\n");
  for (let i = 0; i < saa.length; ++i) {
    ctx.fillText(saa[i], 0 - left, (i - top) * 18 + 15);
  }
  return URL.createObjectURL(await canvas.convertToBlob());
};
