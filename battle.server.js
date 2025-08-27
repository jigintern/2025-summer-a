/**
 * @param {[string, WebSocket]} player1
 * @param {[string, WebSocket]} player2
 */
export const battle = (player1, player2) => {
  // TODO: 対戦を実装する
  console.log(`対戦開始: ${player1[0]} vs ${player2[0]}`);
  player1[1].close(1, "まだ作ってない!");
  player2[1].close(1, "まだ作ってない!");
};
