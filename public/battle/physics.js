/**
 * 対戦の物理演算部分
 */

export class AAObj {
  /** @type {number} */
  r;
  /** @type {[number, number]} */
  x;
  /** @type {[number, number]} */
  dx;

  /**
   * @param {number} r
   * @param {[number, number]} x
   * @param {[number, number]} dx
   */
  constructor(r, x, dx) {
    this.r = r;
    this.x = x;
    this.dx = dx;
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
    this.a.x[0] += this.a.dx[0];
    this.a.x[1] += this.a.dx[1];
    this.b.x[0] += this.b.dx[0];
    this.b.x[1] += this.b.dx[1];
    if (this.#isConfrict()) {
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
      // nと平行な速度成分の大きさ
      const dan = this.a.dx[0] * n[0] + this.a.dx[1] * n[1];
      const dbn = this.b.dx[0] * n[0] + this.b.dx[1] * n[1];
      console.log(dan, dbn);
      // nと垂直な速度成分
      const dap = [this.a.dx[0] - n[0] * dan, this.a.dx[1] - n[1] * dan];
      const dbp = [this.b.dx[0] - n[0] * dbn, this.b.dx[1] - n[1] * dbn];
      // 移動前と移動後の平均速度
      const ap = (dan * this.a.r ** 2 + dbn * this.b.r ** 2) /
        (this.a.r ** 2 + this.b.r ** 2);
      // 衝突後のnと平行な速度成分の大きさ
      const adan = 2 * ap - dan;
      const adbn = 2 * ap - dbn;
      console.log(adan, adbn);
      console.log(n);
      console.log(dap, dbp);
      this.a.dx = [dap[0] + n[0] * adan, dap[1] + n[1] * adan];
      this.b.dx = [dbp[0] + n[0] * adbn, dbp[1] + n[1] * adbn];
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.arc(this.a.x[0], this.a.x[1], this.a.r, 0, 2 * Math.PI);
    ctx.arc(this.b.x[0], this.b.x[1], this.b.r, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }
}
