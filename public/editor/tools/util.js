import charwidth from "../../util/charwidth.json" with { type: "json" };

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
                lineChars.push({ offset, char });
                offset += charwidth[char];
            }
            this.#chars.push(lineChars);
        }
    }
}
