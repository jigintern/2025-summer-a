window.devicePixelRatio = 2;

const popupBackdrop = document.getElementById("popup-backdrop");
const popupHeaderTitle = document.getElementById("popup-header-title");
const popupCloseBt = document.getElementById("popup-close-bt");
const popupAAImage = document.getElementById("popup-aa-canvas");
const popupAATitle = document.getElementById("popup-aa-title");
const popupAACreated = document.getElementById("popup-aa-created");
const popupAAUpdated = document.getElementById("popup-aa-updated");

const closePopup = () => {
  popupBackdrop.style.display = "none";
};

// 日付文字列のフォーマット
const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${mo}/${d} ${h}:${mi}`;
};

popupCloseBt.addEventListener("click", closePopup);
popupBackdrop.addEventListener("click", (e) => {
  if (e.target === popupBackdrop) {
    closePopup();
  }
});

(async () => {
  try {
    const response = await fetch("/AALibraryList", { method: "GET" });
    if (!response.ok) {
      return;
    }
    const json = await response.json();
    const libraries = json["AA"];

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
      const aaData = libraries[i];

      opus.classList.add("opus");
      opus_canvas.classList.add("opus_image");
      opus_title.classList.add("opus_title");
      opus_title.innerText = aaData.title;

      // 一覧のプレビュー描画
      opus_canvas.width = 160 * window.devicePixelRatio;
      opus_canvas.height = 160 * window.devicePixelRatio;
      const listCtx = opus_canvas.getContext("2d");
      const fontSize = 12;
      const lineHeight = 14;
      listCtx.font = `${fontSize}px 'MS PGothic', sans-serif`;
      listCtx.fillStyle = "black";
      const lines = aaData.content.split("\n");
      for (let j = 0; j < lines.length; j++) {
        const y = (j * lineHeight) + fontSize;
        if (y > opus_canvas.height) break;
        listCtx.fillText(lines[j], 5, y);
      }

      // ポップアップ表示のイベントリスナー
      opus.addEventListener("click", () => {
        popupHeaderTitle.innerText = aaData.title;
        popupAATitle.innerText = aaData.title;
        popupAACreated.innerText = formatDate(aaData.created_at);
        popupAAUpdated.innerText = formatDate(aaData.updated_at);

        popupBackdrop.style.display = "flex";

        // ポップアップ内のCanvasに描画
        const popupCtx = popupAAImage.getContext("2d");
        const AA_MAX_WIDTH = 800;
        const AA_MAX_HEIGHT = 560;

        popupAAImage.width = AA_MAX_WIDTH * window.devicePixelRatio;
        popupAAImage.height = AA_MAX_HEIGHT * window.devicePixelRatio;
        popupAAImage.style.width = `${AA_MAX_WIDTH}px`;
        popupAAImage.style.height = `${AA_MAX_HEIGHT}px`;

        popupCtx.fillStyle = "white";
        popupCtx.fillRect(0, 0, popupAAImage.width, popupAAImage.height);

        popupCtx.scale(window.devicePixelRatio, window.devicePixelRatio);

        popupCtx.font = `${fontSize}px 'MS PGothic', sans-serif`;
        popupCtx.fillStyle = "black";

        const popupLines = aaData.content.split("\n");
        for (let j = 0; j < popupLines.length; j++) {
          const y = (j * lineHeight) + fontSize;
          if (y > AA_MAX_HEIGHT) break;
          popupCtx.fillText(popupLines[j], 5, y);
        }
      });

      opus.appendChild(opus_canvas);
      opus.appendChild(opus_title);
      library_parent.appendChild(opus);
    }
  } catch (error) {
    console.error("エラー:", error);
  }
})();
