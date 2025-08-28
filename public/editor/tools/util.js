import charwidth from "../../util/charwidth.json" with { type: "json" };

const whiteSpace = "\u0020\u200a";

/**
 * 「文字の種類と2次元上の位置」でAAを表したもの
 */
export class CharPlace {
  /** @type {{ offset: number, char: string }[][]} */
  #chars;
  /** @type {number} */
  #width;

  /**
   * @param {string} aa アスキーアートの文字列データ
   * @param {number} width アスキーアートの最大幅
   * @param {number} height アスキーアートの最大行数
   */
  constructor(aa, width, height) {
    this.#chars = [];
    this.#width = width;
    for (const line of aa.split("\n")) {
      /** @type {{ offset: number, char: string }[]} */
      const lineChars = [];
      let offset = 0;
      for (const char of line) {
        if (!(char in charwidth)) continue;
        if (!whiteSpace.includes(char)) {
          lineChars.push({ offset, char });
        }
        offset += charwidth[char];
      }
      this.#chars.push(lineChars);
    }
    while (this.#chars.length < height) this.#chars.push([]);
  }

  /**
   * 重なった文字を消す. 後から追加された文字を優先で残す.
   */
  removeOverlap() {
    for (const line of this.#chars) {
      /** @type {(number | null)[]} */
      // 流さthis.#widthのfalseで埋められた配列を作成
      const flg = Array.from({ length: this.#width }, () => false);
      // 文字を後ろ(後から追加された方)から順に見ていく
      for (let i = line.length - 1; i >= 0; --i) {
        const { offset, char } = line[i];
        /** @type {number} このループで処理する文字の幅 */
        const charw = charwidth[char];
        // もし既に見た要素を重複していたら, 削除する
        // このとき, 変数iにちょっと気を付けつつ, 今回は何もしなくていい
        if (flg.slice(offset, offset + charw).some((f) => f)) {
          line.splice(i, 1);
          continue;
        }
        // 既に文字がある, というフラグを立てる
        for (let j = offset; j < offset + charw; ++j) {
          flg[j] = true;
        }
      }
    }
  }

  /**
   * @param {number} line
   * @param {number} offset
   * @param {string} char
   */
  addChar(line, offset, char) {
    if (char in charwidth) {
      if (
        Number.isInteger(line) && Number.isInteger(offset) &&
        0 <= line && line < this.#chars.length &&
        0 <= offset && offset + charwidth[char] <= this.#width
      ) {
        this.#chars[line].push({ offset, char });
      }
    }
  }

  /**
   * 指定した位置を占める文字を削除する
   * @param {number} line
   * @param {number} offset
   */
  removeChar(line, offset) {
    if (Number.isInteger(line) && 0 <= line && line < this.#chars.length) {
      const chars = this.#chars[line];
      for (let i = 0; i < chars.length; ++i) {
        const { char, offset: ofs } = chars[i];
        if (ofs <= offset && offset <= ofs + charwidth[char]) {
          chars.splice(i, 1);
        }
      }
    }
  }

  /**
   * 文字列に変換する
   * @returns {string}
   */
  toAA() {
    this.removeOverlap();
    return this.#chars.map((line) => {
      // 行を文字列化したもの
      let r = "";
      line.sort((a, b) => a.offset - b.offset);
      let lastOffset = 0;
      for (const { offset, char } of line) {
        // 文字間の空白の大きさ
        const whiteWidth = offset - lastOffset;
        r += " ".repeat(Math.floor(whiteWidth / 5));
        r += "\u200a".repeat(whiteWidth % 5);
        r += char;
        lastOffset = offset + charwidth[char];
      }
      return r;
    }).join("\n").trimEnd();
  }

  /**
   * @returns {[number, number, number, number]} [上端, 右端, 下端, 左端]
   */
  getRect() {
    const r = [this.#chars.length, 0, 0, this.#width];
    let flg = true;
    for (let i = 0; i < this.#chars.length; ++i) {
      const line = this.#chars[i];
      for (const { offset, char } of line) {
        flg = false;
        const roffset = offset + charwidth[char];
        if (i < r[0]) r[0] = i;
        if (roffset > r[1]) r[1] = roffset;
        if (i + 1 > r[2]) r[2] = i + 1;
        if (offset < r[3]) r[3] = offset;
      }
    }
    // 文字が無い場合, バグらないように適当な領域を割り当てる
    if (flg) return [0, 18, 1, 0];
    return r;
  }
}
