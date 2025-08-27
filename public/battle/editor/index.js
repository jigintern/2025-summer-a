const form = document.getElementById("joinRoomForm");
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
    const roomArea = document.getElementById("roomArea");
    roomArea.style.display = "block";
    roomArea.textContent = `部屋名: ${roomName}`;
  };

  ws.onclose = (e) => {
    alert(e.reason);
  };
  ws.onerror = (e) => {
    alert(e.type);
  };
});
