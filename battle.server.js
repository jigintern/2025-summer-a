import { GameStatus } from "./public/battle/game-common.js";

/**
 * @param {[string, WebSocket, string]} player1
 * @param {[string, WebSocket, string]} player2
 */
export const battle = (player1, player2) => {
  // TODO: 対戦を実装する
  console.log(`対戦開始: ${player1[0]} vs ${player2[0]}`);
  console.log(`player1 aaId: ${player1[2]}, player2 aaId: ${player2[2]}`);

  player1[1].addEventListener("close", () => {
    // player2がOPENのときだけ通知＆close
    if (player2[1].readyState === 1) {
      if (player2[1].readyState === 1) {
        player2[1].close(4000, "相手が切断しました");
      }
    }
    // 自分自身もclose（すでにclose済みでなければ）
    if (player1[1].readyState === 1) {
      player1[1].close(4000, "自分も終了");
    }
  });

  player2[1].addEventListener("close", () => {
    if (player1[1].readyState === 1) {
      if (player1[1].readyState === 1) {
        player1[1].close(4000, "相手が切断しました");
      }
    }
    if (player2[1].readyState === 1) {
      player2[1].close(4000, "自分も終了");
    }
  });

  // ゲーム状態を生成
  const game = new GameStatus();

  // ランダムで先攻後攻を決める
  if (Math.random() < 0.5) {
    [player1, player2] = [player2, player1];
  }

  // プレイヤー名とターンの対応
  const playerMap = {
    A: player1,
    B: player2,
  };

  // 初期状態を送信
  const sendState = () => {
    const json = game.getJson();
    // それぞれのクライアントに自分の名前を含めて送信
    player1[1].send(JSON.stringify({
      type: "init",
      field: json,
      players: [player1[0], player2[0]],
      myName: player1[0],
      sign: "A",
      aaId: player1[2],
    }));
    player2[1].send(JSON.stringify({
      type: "init",
      field: json,
      players: [player1[0], player2[0]],
      myName: player2[0],
      sign: "B",
      aaId: player2[2],
    }));
  };

  // ターン情報を送信
  /*const sendTurnInfo = () => {
    console.log("ターン情報を送信");

    const json = game.getJson();
    player1[1].send(JSON.stringify({
      type: "init",
      field: json,
      players: [player1[0], player2[0]],
      sign: game.turn,
    }));
    player2[1].send(JSON.stringify({
      type: "init",
      field: json,
      players: [player1[0], player2[0]],
      sign: game.turn,
    }));
  };*/

  // ターン処理
  const handleTurn = (playerKey, rivalKey) => async (event) => {
    console.log("ターン処理");
    try {
      const data = JSON.parse(event.data);
      // ここでゲームロジックを追加（例：状態更新や勝敗判定など）
      console.log(`${playerKey[0]}から受信:`, data);
      // 1.物理演算を進める
      game.addAccel(data.direction, data.power, data.dtt ?? 0);

      // 2. getJson（攻撃直後の盤面）
      const beforeJson = game.getJson();

      // 3. toTurnend（物理演算を進める）
      const outPlayers = game.toTurnend();

      // 4. getJson（ターン終了後の盤面）
      const afterJson = game.getJson();

      // 5. ゲーム終了判定
      if (!game.field.isGameEnd() || outPlayers.length > 0) { // 勝者判定（例：場外に出ていない方が勝ち）
        console.log("ターンが終了");
        if (playerMap[playerKey][1].readyState === 1) {
          console.log("サーバーから受信:", playerMap[rivalKey][1]);
          playerMap[rivalKey][1].close(4000, "ゲーム終了");
        }
        return;
      }

      // 盤面情報を両者に送信

      playerMap[playerKey][1].send(JSON.stringify({
        type: "turn",
        power: data.power,
        direction: data.direction,
        dtt: data.dtt ?? 0,
        beforeField: beforeJson,
        afterField: afterJson,
      }));
      playerMap[rivalKey][1].send(JSON.stringify({
        type: "turn",
        power: data.power,
        direction: data.direction,
        dtt: data.dtt ?? 0,
        beforeField: beforeJson,
        afterField: afterJson,
      }));

      // 次のターンへ

      //sendTurnInfo();
      setTurnHandler();
    } catch (e) {
      console.error(`${playerMap[playerKey][0]}: JSON parse error`, e);
    }
  };

  // 現在のターンのプレイヤーだけが入力できるようにする
  const setTurnHandler = () => {
    player1[1].onmessage = null;
    player2[1].onmessage = null;
    if (game.turn === "A") {
      player1[1].onmessage = handleTurn("A", "B");
    } else {
      player2[1].onmessage = handleTurn("B", "A");
    }
  };

  console.log("最初のターン通知");
  // 最初の状態・ターン通知
  sendState();
  //sendTurnInfo();
  setTurnHandler();

  //クライアント側から情報を受け取る

  //player1[1].close(4000, "まだ作ってない!");
  //player2[1].close(4000, "まだ作ってない!");
};
