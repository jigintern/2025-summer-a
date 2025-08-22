import { CharPlace } from "./util.js";
import charwidth from "../../util/charwidth.json" with { type: "json" };
import { assertEquals } from "jsr:@std/assert";

Deno.test(function parseAndReparse() {
    const str = "Hello,_World!\nKon'nichiwa_Sekai!";
    // スペースが無いならパースして復元すると元に戻ってほしい
    assertEquals(new CharPlace(str, 200, 2).toAA(), str);
});

Deno.test(function charAdds() {
    // 空のアスキーアートを用意
    const cp = new CharPlace("", 100, 4);
    // 一番左上に「a」を配置
    cp.addChar(0, 0, "a");
    // そのすぐ隣に「.」を配置
    cp.addChar(0, charwidth["a"], ".");
    // 3行目にスペース1つ分空けて「b」を配置
    cp.addChar(2, charwidth[" "], "@");
    // 結果的に文字列は"a.\n\n b"になってほしい
    assertEquals(
        cp.toAA(),
        "a.\n\n @",
    );
});
