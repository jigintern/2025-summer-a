document.addEventListener("DOMContentLoaded", () => {
  // デバッグ用
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

  toolButtons.forEach((button) => {
    button.addEventListener("change", updateDebugInfo);
  });

  charButtons.forEach((button) => {
    button.addEventListener("change", updateDebugInfo);
  });

  // 一回呼んどくか
  updateDebugInfo();
});
