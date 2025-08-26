import { line } from "./tools/line.js";

document.addEventListener("DOMContentLoaded", () => {
  const newButton = document.getElementById("btn-new");
  const openButton = document.getElementById("btn-open");
  const saveButton = document.getElementById("btn-save");
  const backButton = document.getElementById("btn-back");

  const handleNew = () => {
    console.log("「新規作成」ボタンが押されました。");
    // ここに新規作成の処理を書いていく
  };

  const handleOpen = () => {
    console.log("「開く」ボタンが押されました。");
    // ここにファイルを開く処理を書いていく
  };

  const handleSave = async () => {
    console.log("「保存」ボタンが押されました。");
    // ここに保存処理を書いていく
    const titleName = document.getElementById("editor-area").value;
    const AA = document.getElementById("editor-area").value;
    console.log(AA, titleName);

    try {
      const response = await fetch("/AALibrary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "title": titleName,
          "AA": AA,
        }),
      });

      if (response.ok) {
        // 成功時の処理
      } else {
        alert(
          "保存に失敗しました",
        );
      }
    } catch (error) {
      console.error("エラー:", error);
      alert(
        "エラーで保存に失敗しました",
      );
    }
  };

  const handleBack = () => {
    if (
      globalThis.confirm("編集中の内容は失われます。タイトルに戻りますか？")
    ) {
      globalThis.location.href = "/";
    }
  };

  // 各ボタンにクリックイベントを設定
  newButton.addEventListener("click", handleNew);
  openButton.addEventListener("click", handleOpen);
  saveButton.addEventListener("click", handleSave);
  backButton.addEventListener("click", handleBack);

  /** @type {HTMLDivElement} */
  const overwrap = document.querySelector("#editor-overwrap");
  /** @type {HTMLTextAreaElement} */
  const textarea = document.querySelector("#editor-area");
  /** @type {HTMLInputElement} */
  const textModeButton = document.querySelector("#btn-text");
  /** @type {HTMLInputElement} */
  const lineModeButton = document.querySelector("#btn-line");
  /** @type {() => unknown} */
  let finishmode = () => {};
  textModeButton.addEventListener("change", () => {
    finishmode();
    overwrap.style.display = "none";
  });
  lineModeButton.addEventListener("change", () => {
    finishmode();
    overwrap.style.display = "block";
    /** @type {[number, number,string] | null} */
    let status = null;
    /** @param {MouseEvent} e */
    const onMousedown = (e) => {
      status = [Math.round(e.offsetY / 18), e.offsetX, textarea.value];
    };
    /** @param {MouseEvent} e */
    const onMousemove = (e) => {
      if (status === null) return;
      textarea.value = line(
        status[2],
        1000,
        40,
        [status[0], status[1]],
        [Math.round(e.offsetY / 18), e.offsetX],
      );
    };
    const onMouseup = () => {
      status = null;
    };
    overwrap.addEventListener("mousedown", onMousedown);
    overwrap.addEventListener("mousemove", onMousemove);
    overwrap.addEventListener("mouseup", onMouseup);
    finishmode = () => {
      overwrap.removeEventListener("mousedown", onMousedown);
      overwrap.removeEventListener("mousemove", onMousemove);
      overwrap.removeEventListener("mouseup", onMouseup);
    };
  });

  // デバッグ用処理
  {
    const debugInfoElement = document.getElementById("debug-info");

    // ラジオボタンのグループを取得
    const toolButtons = document.querySelectorAll('input[name="tool-button"]');
    const charButtons = document.querySelectorAll('input[name="char-bar"]');

    // 選択されている情報を更新して表示する
    const updateDebugInfo = () => {
      // 現在選択されているラジオボタンの要素を取得
      const selectedTool = document.querySelector(
        'input[name="tool-button"]:checked',
      );
      const selectedChar = document.querySelector(
        'input[name="char-bar"]:checked',
      );

      const selectedToolId = selectedTool ? selectedTool.id : "none";
      const selectedCharId = selectedChar ? selectedChar.id : "none";

      // デバッグ用
      debugInfoElement.textContent =
        `選択中のツール: ${selectedToolId} | 選択中のオプション: ${selectedCharId}`;
    };

    // 各ボタンにイベントリスナーを設定する
    toolButtons.forEach((button) => {
      button.addEventListener("change", updateDebugInfo);
    });

    charButtons.forEach((button) => {
      button.addEventListener("change", updateDebugInfo);
    });
    // 一回呼んどくか
    updateDebugInfo();
  }
});
