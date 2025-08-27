window.devicePixelRatio = 2;

(async () => {
  try {
    const response = await fetch("/AALibraryList", { method: "GET" });
    if (!response.ok) {
      return;
    }
    const json = await response.json();
    const libraries = json["AA"];
    document.getElementById("opus_num").innerText = libraries.length + "個";

    if (libraries.length === 0) {
      document.getElementById("opus_is_none").style.display = "block";
    } else {
      document.getElementById("opus_is_none").style.display = "none";
    }

    const library_parent = document.getElementById("opuses");

    for (let i = 0; i < libraries.length; i++) {
      const opus = document.createElement("button");
      const opus_canvas = document.createElement("canvas");
      const opus_title = document.createElement("p");

      opus.classList.add("opus");
      opus.id = "opus_" + libraries[i].title;
      opus_canvas.classList.add("opus_image");
      opus_canvas.id = "opus_img_" + libraries[i].title;
      opus_title.classList.add("opus_title");
      opus_title.id = "opus_tt_" + libraries[i].title;
      opus_title.innerText = libraries[i].title;

      // Canvasの描画サイズを高解像度ディスプレイに対応させる
      opus_canvas.width = 160 * window.devicePixelRatio;
      opus_canvas.height = 160 * window.devicePixelRatio;

      const ctx = opus_canvas.getContext("2d");

      // プレビュー用のフォントと行の高さを設定
      const fontSize = 16; // 12pt ≒ 16px
      const lineHeight = 18;
      ctx.font = `${fontSize}px 'MS PGothic', sans-serif`;
      ctx.fillStyle = "black";

      const aaContent = libraries[i].content;
      const lines = aaContent.split("\n");

      // アスキーアートを一行ずつCanvasに描画する
      for (let j = 0; j < lines.length; j++) {
        const y = (j * lineHeight) + fontSize;
        // Canvasの表示領域を超える場合は描画を中断
        if (y > opus_canvas.height) {
          break;
        }
        // 少し左に余白を空けて描画
        ctx.fillText(lines[j], 5, y);
      }

      opus.appendChild(opus_canvas);
      opus.appendChild(opus_title);
      library_parent.appendChild(opus);
    }
  } catch (error) {
    console.error("エラー:", error);
  }
})();
