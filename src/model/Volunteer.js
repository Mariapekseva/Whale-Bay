// Волонтёр — сидит на базе
import { genId } from './helpers.js';

const VOLUNTEER_NAMES = ['Алёна', 'Денис', 'Ксения', 'Роман', 'София', 'Антон', 'Вероника'];

export class Volunteer {
  constructor(x, y) {
    this.id = genId('vol');                // уникальный идентификатор
    this.name = VOLUNTEER_NAMES[Math.floor(Math.random() * VOLUNTEER_NAMES.length)]; // случайное имя
    this.x = x;                            // позиция на карте
    this.y = y;
    this.message = 'Ожидаю...';            // текущее сообщение
    this.targetId = null;                  // id кита, за которым следит
  }

  // ищем кита в опасности (событие или на мели, здоровье < 50)
  findWhale(whales) {
    for (const w of whales) {
      if (w.health > 0 && !w.saved && (w.event || w.isOnBeach) && w.health < 50) {
        return w;
      }
    }
    return null;
  }

  // отправить сообщение о найденном ките
  sendReport(whale) {
    this.targetId = whale.id;
    this.message = `🚨 ${whale.name} в опасности! x:${Math.round(whale.x)} y:${Math.round(whale.y)}`;
  }

  // сериализовать для отправки в интерфейс
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      message: this.message,
      targetId: this.targetId,
    };
  }
}