const form = document.getElementById("joinRoomForm");
const roomArea = document.getElementById("roomArea");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const roomName = formData.get("roomName");

  const ws = new WebSocket(`ws://${location.host}/ws/battle?room=${roomName}`);

  ws.onopen = () => {
    console.log("WebSocket接続が開かれました");

    // 部屋入室
    alert("部屋入室:");

    // 画面切り替え（例: フォームを非表示、部屋名表示エリアを表示）
    document.getElementById("formsArea").style.display = "none";
    roomArea.style.display = "block";
    roomArea.textContent = `部屋名: ${roomName}`;
  };

  ws.onclose = (e) => {
    alert(e.reason);
  };
  ws.onerror = (e) => {
    alert(e.type);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "battle_start") {
      if (roomArea) {
        roomArea.textContent = `対戦開始: あなた(${data.rival[1]}) vs ${
          data.rival[0]
        }`;

        //サーバーに情報を送る
        ws.send(JSON.stringify({
          type: "join",
        }));
      } else {
        console.warn("要素 #roomArea が見つかりません");
      }
    }

    const attackBtn = document.createElement("button");
    attackBtn.textContent = "攻撃";
    attackBtn.id = "attackBtn";
    roomArea.appendChild(attackBtn);

    attackBtn.addEventListener("click", () => {
      ws.send(JSON.stringify({
        type: "player_action",
        value: "punch", // 例: 攻撃の種類
      }));
    });
  };
});
