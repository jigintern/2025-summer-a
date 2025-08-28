import { line } from "./tools/line.js";
import { erase } from "./tools/erase.js";
import { circle } from "./tools/circle.js";
import { CharPlace } from "./tools/util.js";

document.addEventListener("DOMContentLoaded", () => {
  const newButton = document.getElementById("btn-new");
  const openButton = document.getElementById("btn-open");
  const saveButton = document.getElementById("btn-save");
  const backButton = document.getElementById("btn-back");

  /** @type {HTMLTextAreaElement} */
  const textarea = document.querySelector("#editor-area");
  /** @type {HTMLInputElement} */
  const titleInput = document.querySelector("#title-input");

  // AAの読み込み
  {
    const aaId = new URL(location.href).searchParams.get("id");
    titleInput.value = "Loading...";
    if (aaId) {
      fetch(`/AALibrary/${encodeURIComponent(aaId)}`)
        .then((r) => r.json())
        .then((aainfo) => {
          titleInput.value = aainfo.title;
          textarea.value = aainfo.content;
        })
        .catch(() => {
          alert("AAの読み込みに失敗しました");
          if (titleInput.value === "Loading...") titleInput.value = "";
        });
    } else {
      const now = new Date();
      titleInput.value = `無題 ${now.getFullYear()}-${
        String(now.getMonth() + 1).padStart(2, "0")
      }-${String(now.getDate()).padStart(2, "0")} ${
        String(now.getHours()).padStart(2, "0")
      }:${String(now.getMinutes()).padStart(2, "0")}:${
        String(now.getSeconds()).padStart(2, "0")
      }`;
    }
  }

  const handleNew = () => {
    console.log("「新規作成」ボタンが押されました。");
    // ここに新規作成の処理を書いていく
  };

  const handleOpen = () => {
    console.log("「開く」ボタンが押されました。");

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.showPicker();
    input.onchange = () => {
      if (input.files.length === 0) return;
      const url = URL.createObjectURL(input.files[0]);
      textarea.style.backgroundImage =
        `linear-gradient(rgba(255,255,255,80%)), url(${url})`;
      textarea.style.backgroundPosition = "center";
      textarea.style.backgroundRepeat = "no-repeat";
      textarea.style.backgroundSize = "contain";
    };
  };

  const handleSave = async () => {
    console.log("「保存」ボタンが押されました。");
    // ここに保存処理を書いていく
    const title = titleInput.value;
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
          alert("ログインして下さい１");
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
          alert("ログインして下さい２");
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
  /** @type {HTMLInputElement} */
  const circleModeButton = document.querySelector("#btn-circle");
  const textareaPadding = 6;
  /** @type {() => unknown} */
  let finishmode = () => {};
  textModeButton.addEventListener("change", () => {
    finishmode();
    overwrap.style.display = "none";
    const onchange = () => {
      textarea.value = new CharPlace(textarea.value, 1000, 40).toAA();
    };
    textarea.addEventListener("change", onchange);
    finishmode = () => {
      textarea.removeEventListener("change", onchange);
    };
  });
  // 初期でテキスト入力モードにする
  {
    textModeButton.click();
    overwrap.style.display = "none";
    const onchange = () => {
      textarea.value = new CharPlace(textarea.value, 1000, 40).toAA();
    };
    textarea.addEventListener("change", onchange);
    finishmode = () => {
      textarea.removeEventListener("change", onchange);
    };
  }
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
  circleModeButton.addEventListener("change", () => {
    finishmode();
    overwrap.style.display = "block";
    /** @type {[number, number,string] | null} */
    let status = null;
    /** @param {MouseEvent} e */
    const onMousedown = (e) => {
      status = [
        Math.round((e.offsetY - textareaPadding) / 9) / 2,
        Math.round(e.offsetX - textareaPadding),
        textarea.value,
      ];
    };
    /** @param {MouseEvent} e */
    const onMousemove = (e) => {
      if (status === null) return;
      const r = Math.hypot(
        status[0] * 18 - (e.offsetY - textareaPadding),
        status[1] - (e.offsetX - textareaPadding),
      );
      if (status[0] % 1 === 0) {
        textarea.value = circle(
          status[2],
          1000,
          40,
          status[1],
          status[0] - Math.round(r / 18),
          status[0] + Math.round(r / 18),
        );
      } else {
        textarea.value = circle(
          status[2],
          1000,
          40,
          status[1],
          status[0] - Math.floor(r / 18) - 0.5,
          status[0] + Math.floor(r / 18) + 0.5,
        );
      }
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
});
