// Спасатель — человек, который помогает китам
import { genId } from './helpers.js';

export class Rescuer {
  constructor(x, y, name, gender) {
    this.id = genId('resc');           // уникальный идентификатор
    this.name = name;                  // имя спасателя
    this.gender = gender;              // пол (male/female)
    this.x = x;                        // текущая позиция по x
    this.y = y;                        // текущая позиция по y
    this.homeX = x;                    // координаты базы (куда возвращаться)
    this.homeY = y;
    this.boatX = 9;                    // где стоит лодка
    this.boatY = 13.5;
    this.state = 'idle';               // состояние: idle, going, on_boat, helping, returning
    this.targetId = null;              // id кита, к которому идёт
    this.isOnBoat = false;             // в лодке ли
    this.rescuedCount = 0;             // сколько спасений за выезд (макс 3)
    this.whalesSaved = 0;              // всего спасено за игру
    this.helpTicks = 0;                // сколько тиков помогает текущему киту
    this.speed = 0.1;                  // скорость перемещения
  }

  // возвращает эмодзи в зависимости от пола
  getEmoji() {
    return this.gender === 'male' ? '👨' : '👩';
  }

  // отправиться к лодке, чтобы спасти кита
  goToBoat(id) {
    this.targetId = id;
    this.state = 'going';
  }

  // вернуться на базу
  goHome() {
    this.state = 'returning';
    this.isOnBoat = false;
    this.targetId = null;
  }

  // сделать шаг к заданной точке, вернуть true если дошёл
  stepTo(tx, ty) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.3) {
      this.x = tx;
      this.y = ty;
      return true;
    }
    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;
    return false;
  }

  //  для отправки в интерфейс
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      gender: this.gender,
      x: this.x,
      y: this.y,
      state: this.state,
      targetId: this.targetId,
      isOnBoat: this.isOnBoat,
      rescuedCount: this.rescuedCount,
      whalesSaved: this.whalesSaved,
      helpTicks: this.helpTicks,
    };
  }
}