/**
 * @param {[string, WebSocket]} player1
 * @param {[string, WebSocket]} player2
 */
export const battle = (player1, player2) => {
  // TODO: 対戦を実装する
  console.log(`対戦開始: ${player1[0]} vs ${player2[0]}`);

  // 初期状態を設定
  let currentTurn = Math.random() < 0.5 ? 1 : 2;
  const startInformation = {
    type: "battle_start", //ゲームの進行
    players: [player1[0], player2[0]], //ユーザー名
    power: 0, //力の強さ
    direction: 0, //力の方向
    player1Coordinates: { x: 0, y: 0 }, // プレイヤー1の座標(今)
    player2Coordinates: { x: 0, y: 0 }, // プレイヤー2の座標(今)
    turn: currentTurn === 1 ? player1[0] : player2[0],
  };

  // 初期状態を送信
  const start1 = JSON.stringify({
    ...startInformation,
    myName: player1[0], // 受信者自身の名前
  });
  const start2 = JSON.stringify({
    ...startInformation,
    myName: player2[0], // 受信者自身の名前
  });
  player1[1].send(start1);
  player2[1].send(start2);

  // ターン情報を送信
  const sendTurnInfo = () => {
    console.log("ターン情報を送信");
    const turnInfo = {
      type: "turn",
      turn: currentTurn === 1 ? player1[0] : player2[0],
    };

    player1[1].send(JSON.stringify(turnInfo));
    player2[1].send(JSON.stringify(turnInfo));
  };

  const Logic = () => {
    // ゲームのロジックをここに実装
  };

  // ターン処理
  const handleTurn = (player, rival, nextTurn) => async (event) => {
    console.log("ターン処理");
    try {
      const data = JSON.parse(event.data);
      // ここでゲームロジックを追加（例：状態更新や勝敗判定など）
      Logic();

      console.log(`${player[0]}から受信:`, data);

      // 相手にも行動内容を通知
      rival[1].send(
        JSON.stringify({
          type: "opponentAction",
          power: data.power,
          direction: data.direction,
          data,
        }),
      );

      player[1].send(
        JSON.stringify({
          type: "myselfAction",
          power: data.power,
          direction: data.direction,
          data,
        }),
      );

      // 次のターンへ
      currentTurn = nextTurn;
      sendTurnInfo();
      setTurnHandler();
    } catch (e) {
      console.error(`${player[0]}: JSON parse error`, e);
    }
  };

  // 現在のターンのプレイヤーだけが入力できるようにする
  const setTurnHandler = () => {
    player1[1].onmessage = null;
    player2[1].onmessage = null;
    if (currentTurn === 1) {
      player1[1].onmessage = handleTurn(player1, player2, 2);
    } else {
      player2[1].onmessage = handleTurn(player2, player1, 1);
    }
  };

  console.log("最初のターン通知");
  // 最初のターン通知
  sendTurnInfo();
  setTurnHandler();
  console.log("setTurnHandler後");

  //クライアント側から情報を受け取る

  //player1[1].close(4000, "まだ作ってない!");
  //player2[1].close(4000, "まだ作ってない!");
};
