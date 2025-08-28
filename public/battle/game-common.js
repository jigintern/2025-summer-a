import { AAObj, BattleStatus } from "./physics.js";

export class GameStatus {
  /** @type {"A" | "B"} */
  turn;
  /** @type {BattleStatus} */
  field;

  constructor() {
    this.turn = "A";
    this.field = new BattleStatus(
      new AAObj(100, [250, 250], [0, 0], 0, 0),
      new AAObj(100, [750, 250], [0, 0], 0, 0),
    );
  }

  /**
   * 加速度を与える
   * @param {"A" | "B"} player
   * @param {number} direction 向き (弧度法で指定)
   * @param {number} power 攻撃の強さ (0 ~ 1)
   * @param {number} dtt 回転の具合 (-1 ~ 1)
   */
  addAccel(player, direction, power, dtt) {
    if (power < 0 || 1 < power) return;
    if (dtt < 0 || 1 < dtt) return;
    const obj = player === "A" ? this.field.a : this.field.b;
    obj.dx = [power * Math.cos(direction) / 2, power * Math.cos(direction / 2)];
    obj.dtt = 4 * Math.PI * dtt;
  }

  /**
   * 全てのオブジェクトが止まるか, 誰かが場外に出るまで時間をすすめる
   * @returns {("A" | "B")[]} 場外に出たプレイヤーの配列. 空なら続行
   */
  turnend() {
    while (!(this.field.isStopping() || this.field.isGameEnd())) {
      this.field.nextTick();
    }
    /** @type {("A" | "B")[]} */
    const r = [];
    if (!this.field.a.isInField()) r.push("A");
    if (!this.field.b.isInField()) r.push("B");
    return r;
  }
}
