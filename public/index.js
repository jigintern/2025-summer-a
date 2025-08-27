window.devicePixelRatio = 2;

(async () => {
  try {
    const response = await fetch("/AALibraryList", { method: "GET" });
    if (!response.ok) {
      // ログインページなど、エラー時のリダイレクト先があればここに記述します。
      // location.href = "/login/";
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

    const row_string_cnt = 100;
    const font_size = 50;

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

      const aryText = libraries[i].content;

      const aryRow = [];
      aryRow[0] = "";
      let row_cnt = 0;

      for (let j = 0; j < aryText.length; j++) {
        let text = aryText[j];
        if (aryRow[row_cnt].length >= row_string_cnt) {
          row_cnt++;
          aryRow[row_cnt] = "";
        }
        if (text == "\n") {
          row_cnt++;
          aryRow[row_cnt] = "";
          text = "";
        }
        aryRow[row_cnt] += text;
      }

      const ctx = opus_canvas.getContext("2d");

      for (let j = 0; j < aryRow.length; j++) {
        const aryStr = aryRow[j].split("");
        for (let k = 0; k < aryStr.length; k++) {
          ctx.fillText(
            aryStr[k],
            k * font_size / 4 + 0.5,
            (j * font_size) / 4 + 10 + 0.5,
          );
        }
      }

      opus.appendChild(opus_canvas);
      opus.appendChild(opus_title);
      library_parent.appendChild(opus);
    }
  } catch (error) {
    console.error("エラー:", error);
    // ログインページなど、エラー時のリダイレクト先があればここに記述します。
    // location.href = "/login/";
  }
})();
