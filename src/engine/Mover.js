// mover - отвечает за то как ходят персонажи по карте

export class Mover {
  constructor(layout) {
    this.layout = layout;        // карта, чтобы проверять, можно ли наступить
    this.x = 0;                 // где я сейчас
    this.y = 0;
    this.prevX = -1;            // где была прошлый раз 
    this.prevY = -1;
    this.targetX = 0;           // куда хочу прийти
    this.targetY = 0;
    this.arrived = true;        // дошла или нет
  }

  // запомнить, где стоит
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  // сказать, куда идти
  setDestination(tx, ty) {
    this.targetX = tx;
    this.targetY = ty;
    this.arrived = (tx === this.x && ty === this.y);
  }

  // сделать один шаг к цели
  step() {
    // если уже на месте, стоять
    if (this.arrived) return { x: this.x, y: this.y };

    //  в какую сторону двигаться
    const dx = Math.sign(this.targetX - this.x);
    const dy = Math.sign(this.targetY - this.y);

    // сначала пытается идти по той оси, где расстояние больше
    const horizFirst = Math.abs(this.targetX - this.x) >= Math.abs(this.targetY - this.y);
    const moves = horizFirst ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]];
    
    // если не получается - обойти сбоку
    moves.push([0, 1], [0, -1], [1, 0], [-1, 0]);

    // выбираю первый свободный шаг 
    const picked = this._firstWalkable(moves, true) ?? this._firstWalkable(moves, false);

    // если есть куда идти - шаг
    if (picked) {
      this.prevX = this.x;
      this.prevY = this.y;
      this.x += picked[0];
      this.y += picked[1];
    }

    // проверка, дошел ли до цели
    if (this.x === this.targetX && this.y === this.targetY) {
      this.arrived = true;
    }

    return { x: this.x, y: this.y };
  }

  // ищет первый подходящий шаг из списка
  _firstWalkable(moves, avoidPrev) {
    for (const [mx, my] of moves) {
      if (mx === 0 && my === 0) continue;           // стоять на месте не надо
      const nx = this.x + mx;
      const ny = this.y + my;
      if (!this.layout.isWalkable(nx, ny)) continue; // туда нельзя 
      if (avoidPrev && nx === this.prevX && ny === this.prevY) continue; // назад!
      return [mx, my]; // нашла куда идти
    }
    return null; // ничего не подошло 
  }

  // проверка
  hasArrived() {
    return this.arrived;
  }
}