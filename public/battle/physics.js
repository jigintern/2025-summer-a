/**
 * 対戦の物理演算部分
 */

const fieldWidth = 1000;
const fieldHeight = 500;

export class AAObj {
  /** @type {number} */
  r;
  /** @type {[number, number]} */
  x;
  /** @type {[number, number]} */
  dx;
  /** @type {number} 角度 */
  tt;
  /** @type {number} 角速度 */
  dtt;
  /** @type {number} 摩擦で生じる加速度 */
  mu = 0.01;

  /**
   * @param {number} r
   * @param {[number, number]} x
   * @param {[number, number]} dx
   * @param {number} tt
   * @param {number} dtt
   */
  constructor(r, x, dx, tt, dtt) {
    this.r = r;
    this.x = x;
    this.dx = dx;
    this.tt = tt;
    this.dtt = dtt;
  }

  /**
   * オブジェクトが止まっているか判定
   * @returns {boolean}
   */
  isStopping() {
    return this.dx[0] === 0 && this.dx[1] === 0 && this.dtt === 0;
  }

  /**
   * 場外に出ていないか判定
   * @returns {boolean}
   */
  isInOfField() {
    const r = this.r;
    const [x, y] = this.x;
    return -r < x && x < r + fieldWidth && -r < y && y < r + fieldHeight;
  }
}

export class BattleStatus {
  /** @type {AAObj} */
  a;
  /** @type {AAObj} */
  b;

  /**
   * @param {AAObj} a
   * @param {AAObj} b
   */
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  /**
   * 衝突中か判定
   * @returns {boolean}
   */
  #isConfrict() {
    return Math.hypot(this.a.x[0] - this.b.x[0], this.a.x[1] - this.b.x[1]) <=
      this.a.r + this.b.r;
  }

  nextTick() {
    let ans = false;
    this.a.x[0] += this.a.dx[0];
    this.a.x[1] += this.a.dx[1];
    this.a.tt += this.a.dtt;
    this.b.x[0] += this.b.dx[0];
    this.b.x[1] += this.b.dx[1];
    this.b.tt += this.b.dtt;
    if (this.#isConfrict()) {
      ans = true;
      this.a.x[0] -= this.a.dx[0];
      this.a.x[1] -= this.a.dx[1];
      this.b.x[0] -= this.b.dx[0];
      this.b.x[1] -= this.b.dx[1];
      // 接面の法線ベクトル
      const n = [this.a.x[0] - this.b.x[0], this.a.x[1] - this.b.x[1]];
      {
        // nを正規化
        const d = Math.hypot(...n);
        n[0] /= d;
        n[1] /= d;
      }
      // 接面の接線ベクトル
      const p = [n[1], 0 - n[0]];
      // nと平行な速度成分の大きさ
      const dan = this.a.dx[0] * n[0] + this.a.dx[1] * n[1];
      const dbn = this.b.dx[0] * n[0] + this.b.dx[1] * n[1];
      // nと垂直な速度成分の大きさ
      const dap = this.a.dx[0] * p[0] + this.a.dx[1] * p[1];
      const dbp = this.b.dx[0] * p[0] + this.b.dx[1] * p[1];
      // nと垂直な速度成分の大きさ (境界成分)
      const dapt = dap + this.a.r * this.a.dtt;
      const dbpt = dbp - this.a.r * this.b.dtt;
      // 移動前と移動後の平均速度
      const ap = (dan * this.a.r ** 2 + dbn * this.b.r ** 2) /
        (this.a.r ** 2 + this.b.r ** 2);
      // 衝突後のnと平行な速度成分の大きさ
      const adan = 2 * ap - dan;
      const adbn = 2 * ap - dbn;
      const dcpt = (dapt * this.a.r ** 2 + dbpt * this.b.r ** 2) /
        (this.a.r ** 2 + this.b.r ** 2);
      const adap = dap + (dcpt - dapt) / 3;
      const adbp = dbp + (dcpt - dbpt) / 3;
      this.a.dtt += ((dcpt - dapt) / 3 * 2) / this.a.r;
      this.b.dtt -= ((dcpt - dbpt) / 3 * 2) / this.b.r;
      this.a.dx = [p[0] * adap + n[0] * adan, p[1] * adap + n[1] * adan];
      this.b.dx = [p[0] * adbp + n[0] * adbn, p[1] * adbp + n[1] * adbn];
    }
    // 摩擦で減速させる
    // 速度の大きさ
    const va = Math.hypot(...this.a.dx);
    const vb = Math.hypot(...this.b.dx);
    if (va <= this.a.mu) {
      this.a.dx = [0, 0];
      this.a.dtt = 0;
    } else {
      this.a.dx[0] -= this.a.dx[0] / va * this.a.mu;
      this.a.dx[1] -= this.a.dx[1] / va * this.a.mu;
      this.a.dtt *= 1 - (this.a.mu / va);
    }
    if (vb <= this.b.mu) {
      this.b.dx = [0, 0];
      this.b.dtt = 0;
    } else {
      this.b.dx[0] -= this.b.dx[0] / vb * this.b.mu;
      this.b.dx[1] -= this.b.dx[1] / vb * this.b.mu;
      this.b.dtt *= 1 - (this.b.mu / vb);
    }

    return ans;
  }

  /**
   * 全てのオブジェクトが止まっているか判定
   * @returns {boolean}
   */
  isStopping() {
    return this.a.isStopping() && this.b.isStopping();
  }
}
