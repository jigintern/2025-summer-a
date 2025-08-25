let opuses_length = 0;

(async () => {
  const response = await fetch("/AALibraryList", [method, "GET"]);
  const json = await response.json();
  const libraries = json["AA"];
  document.getElementById("opus_num").innerText = libraries.length;
});

const libraries = [["name1", "(・w・)"], ["name2", "test"], [
  "name3",
  "　 ∧＿∧　\n（｡･ω･｡)つ━☆・*。\n⊂　　 ノ 　　　・゜+.\n　しーＪ　　　°。+ *´¨)\n　　　　　　　　　.· ´¸.·*´¨) ¸.·*¨)\n　　　　　　　　　　(¸.·´ (¸.·'* ☆",
]];

opuses_length = libraries.length;

if (opuses_length === 0) {
  document.getElementById("opus_is_none").style.display = "block";
  console.log(opuses_length);
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
  opus.id = "opus_" + libraries[i][0];
  opus_canvas.classList.add("opus_image");
  opus_canvas.id = "opus_img_" + libraries[i][0];
  opus_title.classList.add("opus_title");
  opus_title.id = "opus_tt_" + libraries[i][0];

  opus_title.innerText = libraries[i][0];

  const aryText = libraries[i][1];

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
    aryStr = aryRow[j].split("");
    for (let k = 0; k < aryStr.length; k++) {
      ctx.fillText(aryStr[k], k * font_size / 4, (j * font_size) / 4 + 10);
    }
  }

  opus.appendChild(opus_canvas);
  opus.appendChild(opus_title);
  library_parent.appendChild(opus);
}
