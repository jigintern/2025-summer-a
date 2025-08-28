const form = document.getElementById("joinRoomForm");
const roomArea = document.getElementById("roomArea");
let myName = "";

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

  let attackBtn = null;

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("サーバーから受信:", data);

    if (data.type === "battle_start") {
      myName = data.myName; // サーバーから自分の名前を取得
      if (roomArea) {
        roomArea.textContent = `対戦開始: あなた(${myName}) vs ${
          data.players.find((n) => n !== myName)
        }`;
      } else {
        console.warn("要素 #roomArea が見つかりません");
      }
    }

    if (data.type === "turn") {
      // 自分のターンだけ攻撃ボタンを表示
      if (data.turn === myName) {
        if (!attackBtn) {
          attackBtn = document.createElement("button");
          attackBtn.textContent = "攻撃";
          attackBtn.id = "attackBtn";
          roomArea.appendChild(attackBtn);
          attackBtn.addEventListener("click", () => {
            ws.send(JSON.stringify({
              power: 3.1419,
              direction: 3.1419,
            }));
            attackBtn.disabled = true; // 連打防止
          });
        }
        attackBtn.disabled = false;
      } else {
        if (attackBtn) attackBtn.disabled = true;
      }
    }

    if (data.type === "opponentAction") {
      // 相手の行動を表示したい場合
      console.log("相手の行動:", data.action);
    }
    if (data.type === "myselfAction") {
      // 自分の行動を表示したい場合
      console.log("自分の行動:", data.action);
    }
  };
});
