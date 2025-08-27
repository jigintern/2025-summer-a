/**
 * @param {[string, WebSocket]} player1
 * @param {[string, WebSocket]} player2
 */
export const battle = (player1, player2) => {
  // TODO: 対戦を実装する
  console.log(`対戦開始: ${player1[0]} vs ${player2[0]}`);

  // 初期状態を設定
  const startInformation = {
    type: "battle_start", //ゲームの進行
    rival: [player1[0], player2[0]], //ユーザー名
    power: 0, //力の強さ
    direction: 0, //力の方向
    player1Coordinates: { x: 0, y: 0 }, // プレイヤー1の座標(今)
    player2Coordinates: { x: 0, y: 0 }, // プレイヤー2の座標(今)
  };

  if (startInformation.type === "battle_start") {
    //初期状態を送信
    const start = JSON.stringify(startInformation);
    player1[1].send(start);
    player2[1].send(start);
  }

  // クライアントからの情報を受け取る
  player1[1].onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log(`player1から受信:`, data);
      // ここで処理を追加
    } catch (e) {
      console.error("player1: JSON parse error", e);
    }
  };

  player2[1].onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log(`player2から受信:`, data);
      // ここで処理を追加
    } catch (e) {
      console.error("player2: JSON parse error", e);
    }
  };

  //クライアント側から情報を受け取る

  //player1[1].close(4000, "まだ作ってない!");
  //player2[1].close(4000, "まだ作ってない!");
};
