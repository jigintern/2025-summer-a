document.addEventListener("DOMContentLoaded", () => {
  // デバッグ用
  const debugInfoElement = document.getElementById("debug-info");

  // ラジオボタンのグループを取得
  const toolButtons = document.querySelectorAll('input[name="tool-button"]');
  const charButtons = document.querySelectorAll('input[name="char-bar"]');

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
});
