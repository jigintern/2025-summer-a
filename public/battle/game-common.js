import { AAObj, BattleStatus } from "./physics.js";

export class GameStatus {
  /** @type {"A" | "B"} */
  turn;
  /** @type {BattleStatus} */
  field;
  /** @type {number} */
  #timeSpend = 0;

  constructor() {
    this.turn = "A";
    this.field = new BattleStatus(
      new AAObj(100, [250, 250], [0, 0], 0, 0),
      new AAObj(100, [750, 250], [0, 0], 0, 0),
    );
  }

  /**
   * 加速度を与える
   * @param {number} direction 向き (弧度法で指定)
   * @param {number} power 攻撃の強さ (0 ~ 1)
   * @param {number} dtt 回転の具合 (-1 ~ 1)
   */
  addAccel(direction, power, dtt) {
    if (!this.field.isStopping()) {
      throw new Error("ターンがまだ終わっていないのに攻撃が行なわれました");
    }
    if (this.field.isGameEnd()) {
      throw new Error("既にゲームは終了しています");
    }
    this.#timeSpend = 0;
    if (power < 0 || 1 < power) return;
    if (dtt < 0 || 1 < dtt) return;
    const obj = this.turn === "A" ? this.field.a : this.field.b;
    this.turn = this.turn === "A" ? "B" : "A";
    obj.dx = [power * Math.cos(direction) / 2, power * Math.cos(direction / 2)];
    obj.dtt = 4 * Math.PI * dtt;
  }

  /**
   * 全てのオブジェクトが止まるか, 誰かが場外に出るまで時間をすすめる
   * @returns {("A" | "B")[]} 場外に出たプレイヤーの配列. 空なら続行
   */
  toTurnend() {
    while (!this.isTurnFinished()) {
      this.field.nextTick();
      this.#timeSpend += 1;
    }
    /** @type {("A" | "B")[]} */
    const r = [];
    if (!this.field.a.isInField()) r.push("A");
    if (!this.field.b.isInField()) r.push("B");
    return r;
  }

  /**
   * アニメーション用に少しずつ時間を進める
   * @param {number} delta 攻撃開始からの経過時間 (ミリ秒)
   */
  advance(delta) {
    while (this.#timeSpend < delta) {
      this.field.nextTick();
      this.#timeSpend += 1;
    }
  }

  /**
   * ターンが終わった(次の人が攻撃可能か, 決着が付いた)か判定
   * @returns {boolean}
   */
  isTurnFinished() {
    return this.field.isStopping() || this.field.isGameEnd();
  }
}
