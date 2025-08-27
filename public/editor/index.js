import { line } from "./tools/line.js";
import { erase } from "./tools/erase.js";

document.addEventListener("DOMContentLoaded", () => {
  const newButton = document.getElementById("btn-new");
  const openButton = document.getElementById("btn-open");
  const saveButton = document.getElementById("btn-save");
  const backButton = document.getElementById("btn-back");

  /** @type {HTMLTextAreaElement} */
  const textarea = document.querySelector("#editor-area");

  // AAの読み込み
  {
    const aaId = new URL(location.href).searchParams.get("id");
    textarea.value = "Loading...";
    if (aaId) {
      fetch(`/AALibrary/${encodeURIComponent(aaId)}`)
        .then((r) => r.json())
        .then((aainfo) => {
          textarea.value = aainfo.content;
        })
        .catch(() => {
          alert("AAの読み込みに失敗しました");
          if (textarea.value === "Loading...") textarea.value = "";
        });
    }
  }

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
    const title = `作品-${Date.now()}`; // TODO: タイトルを入力できるようにする
    const AA = textarea.value;
    const aaId = new URL(location.href).searchParams.get("id");

    try {
      if (aaId == null) {
        const response = await fetch("/AALibrary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, AA }),
        });

        if (response.ok) {
          const { aaId } = await response.json();
          history.replaceState(null, "", `/editor/?id=${aaId}`);
        } else if (response.status === 401) {
          alert("ログインして下さい");
        } else {
          alert("保存に失敗しました");
        }
      } else {
        const response = await fetch(`/AALibrary/${encodeURIComponent(aaId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, AA }),
        });

        if (response.ok) {
          // なんかポップアップ出したい
        } else if (response.status === 401) {
          alert("ログインして下さい");
        } else {
          alert("保存に失敗しました");
        }
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
  /** @type {HTMLInputElement} */
  const textModeButton = document.querySelector("#btn-text");
  /** @type {HTMLInputElement} */
  const lineModeButton = document.querySelector("#btn-line");
  /** @type {HTMLInputElement} */
  const eraseModeButton = document.querySelector("#btn-erase");
  const textareaPadding = 6;
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
      status = [
        Math.round((e.offsetY - textareaPadding) / 18),
        Math.round(e.offsetX - textareaPadding),
        textarea.value,
      ];
    };
    /** @param {MouseEvent} e */
    const onMousemove = (e) => {
      if (status === null) return;
      textarea.value = line(
        status[2],
        1000,
        40,
        [status[0], status[1]],
        [
          Math.round((e.offsetY - textareaPadding) / 18),
          Math.round(e.offsetX - textareaPadding),
        ],
      );
    };
    const onMouseup = () => {
      status = null;
    };
    overwrap.addEventListener("mousedown", onMousedown);
    overwrap.addEventListener("mousemove", onMousemove);
    window.addEventListener("mouseup", onMouseup);
    finishmode = () => {
      overwrap.removeEventListener("mousedown", onMousedown);
      overwrap.removeEventListener("mousemove", onMousemove);
      window.removeEventListener("mouseup", onMouseup);
    };
  });
  eraseModeButton.addEventListener("change", () => {
    finishmode();
    overwrap.style.display = "block";
    /** @type {boolean} */
    let ismousedown = false;
    /** @param {MouseEvent} e */
    const onMousedown = (e) => {
      ismousedown = true;
      textarea.value = erase(
        textarea.value,
        1000,
        40,
        [
          Math.floor((e.offsetY - textareaPadding) / 18),
          Math.round(e.offsetX - textareaPadding),
        ],
      );
    };
    /** @param {MouseEvent} e */
    const onMousemove = (e) => {
      if (!ismousedown) return;
      textarea.value = erase(
        textarea.value,
        1000,
        40,
        [
          Math.floor((e.offsetY - textareaPadding) / 18),
          Math.round(e.offsetX - textareaPadding),
        ],
      );
    };
    const onMouseup = () => {
      ismousedown = false;
    };
    overwrap.addEventListener("mousedown", onMousedown);
    overwrap.addEventListener("mousemove", onMousemove);
    window.addEventListener("mouseup", onMouseup);
    finishmode = () => {
      overwrap.removeEventListener("mousedown", onMousedown);
      overwrap.removeEventListener("mousemove", onMousemove);
      window.removeEventListener("mouseup", onMouseup);
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
