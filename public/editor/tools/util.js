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
     */
    constructor(aa, width) {
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
            this.#chars[line].push({ offset, char });
        }
    }
}
