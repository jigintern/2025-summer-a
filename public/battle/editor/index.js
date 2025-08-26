const createForm = document.getElementById("createRoomForm");
const joinForm = document.getElementById("joinRoomForm");

// ユーザー一覧を更新する関数
function updateUsersArea(users) {
  let usersArea = document.getElementById("usersArea");
  if (!usersArea) {
    usersArea = document.createElement("div");
    usersArea.id = "usersArea";
    document.getElementById("roomArea").after(usersArea);
  }
  usersArea.textContent = "参加者: " + users.join(", ");
}

//ルーム作成
createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("部屋作成中...");
  const formData = new FormData(createForm);
  const res = await fetch("/create-room", { method: "POST", body: formData });
  if (res.ok) {
    // 部屋作成成功
    alert("部屋作成成功:", res.roomName);
  } else {
    // 部屋作成失敗
    alert("部屋作成失敗:");
  }
});

//ルーム参加
joinForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(joinForm);
  const roomName = formData.get("roomName");
  const userName = formData.get("userName");
  console.log("join-roomへ送信するroomName:", roomName);
  const res = await fetch("/join-room", { method: "POST", body: formData });

  if (res.ok) {
    // 部屋入室
    alert("部屋入室:");

    // WebSocket接続
    ws = new WebSocket(
      `ws://localhost:8000/ws?room=${roomName}&user=${userName}`,
    );

    ws.onopen = async () => {
      // 画面切り替え（例: フォームを非表示、部屋名表示エリアを表示）
      document.getElementById("formsArea").style.display = "none";
      const roomArea = document.getElementById("roomArea");
      roomArea.style.display = "block";
      roomArea.textContent = `部屋名: ${roomName}`;
      // ユーザー一覧取得
      const usersRes = await fetch(`/room-users?room=${roomName}`);
      if (usersRes.ok) {
        const users = await usersRes.json();
        updateUsersArea(users);
      }
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "users") {
          updateUsersArea(data.users);
        } else {
          // 他のtypeの場合（例: チャット）
          chatPre.textContent += e.data + "\n";
        }
      } catch {
        // JSONでない場合（従来のチャット等）
        chatPre.textContent += e.data + "\n";
      }
    };
  } else {
    // 部屋作成失敗
    alert("部屋番号が違います:");
  }
});
