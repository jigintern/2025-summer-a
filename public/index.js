import { aa2blob } from "./util/aa2img.js";

window.devicePixelRatio = 2;

const popupBackdrop = document.getElementById("popup-backdrop");
const popupHeaderTitle = document.getElementById("popup-header-title");
const popupCloseBt = document.getElementById("popup-close-bt");
const popupAAImage = document.getElementById("popup-aa-img");
const popupAATitle = document.getElementById("popup-aa-title");
const popupAACreated = document.getElementById("popup-aa-created");
const popupAAUpdated = document.getElementById("popup-aa-updated");
const popupEditBt = document.getElementById("popup-edit-bt");

const closePopup = () => {
  popupBackdrop.style.display = "none";
};

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
popupEditBt.addEventListener("click", () => {
  const aaId = popupEditBt.dataset.aaId;
  if (aaId) {
    location.href = `/editor/?id=${aaId}`;
  }
});
popupBackdrop.addEventListener("click", (e) => {
  if (e.target === popupBackdrop) {
    closePopup();
  }
});

(async () => {
  try {
    const response = await fetch("/AALibraryList", { method: "GET" });
    if (!response.ok) return;

    const json = await response.json();
    const libraries = json["AA"];

    document.getElementById("opus_is_none").style.display =
      libraries.length === 0 ? "block" : "none";

    const library_parent = document.getElementById("opuses");

    for (const aaData of libraries) {
      const opus = document.createElement("button");
      const opus_img = document.createElement("img");
      const opus_title = document.createElement("p");

      opus.classList.add("opus");
      opus_img.classList.add("opus_image");
      opus_title.classList.add("opus_title");
      opus_title.innerText = aaData.title;

      // 一覧のプレビュー画像の生成
      await aa2blob(aaData.content).then((url) => {
        opus_img.src = url;
      });

      // ポップアップ表示
      opus.addEventListener("click", () => {
        popupHeaderTitle.innerText = aaData.title;
        popupAATitle.innerText = aaData.title;
        popupAACreated.innerText = formatDate(aaData.created_at);
        popupAAUpdated.innerText = formatDate(aaData.updated_at);

        popupEditBt.dataset.aaId = aaData.id;

        popupAAImage.src = "";
        aa2blob(aaData.content).then((url) => {
          popupAAImage.src = url;
        });

        popupBackdrop.style.display = "flex";
      });

      opus.appendChild(opus_img);
      opus.appendChild(opus_title);
      library_parent.appendChild(opus);
    }
  } catch (error) {
    console.error("エラー:", error);
  }
})();
