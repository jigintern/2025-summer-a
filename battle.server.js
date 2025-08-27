/**
 * @param {[string, WebSocket]} player1
 * @param {[string, WebSocket]} player2
 */
export const battle = (player1, player2) => {
  // TODO: 対戦を実装する
  console.log(`対戦開始: ${player1[0]} vs ${player2[0]}`);

  // クライアントに対戦開始メッセージを送信
  const startInformation = {
    type: "battle_start",
    rival: [player1[0], player2[0]],
  };
  const start = JSON.stringify(startInformation);

  player1[1].send(start);
  player2[1].send(start);

  //player1[1].close(4000, "まだ作ってない!");
  //player2[1].close(4000, "まだ作ってない!");
};
