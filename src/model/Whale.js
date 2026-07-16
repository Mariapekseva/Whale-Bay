// Кит
import { genId, randomWhaleName } from './helpers.js';

export class Whale {
  constructor(x, y) {
    this.id = genId('whale');               // уникальный идентификатор
    this.name = randomWhaleName();          // случайное имя из списка
    this.x = x;                             // позиция на карте
    this.y = y;
    this.size = 22 + Math.random() * 12;    // размер (для отрисовки)
    this.health = 100;                      // здоровье (0-100)
    this.saved = false;                     // спасён ли
    this.isOnBeach = false;                 // на мели ли
    this.group = 'ГРУППА 1';                // группа (ГРУППА 1, ГРУППА 2, ОДИНОЧКА)
    this.groupColor = '#4FC3F7';            // цвет группы
    this.isLone = false;                    // одиночка ли
    this.age = Math.floor(2 + Math.random() * 8); // возраст (лет)
    this.maxAge = 18 + Math.floor(Math.random() * 7); // максимальный возраст
    this.deathReason = null;                // причина смерти (если умер)
    this.helpCount = 0;                     // сколько раз помогали
    this.event = null;                      // id активного события
    this.eventTimer = 0;                    // таймер события
    this.eventName = null;                  // название события
    this.speed = 0.015 + Math.random() * 0.01; // скорость плавания
    this.angle = Math.random() * Math.PI * 2;  // направление движения
  }

  // движение для одиноких китов (свободное плавание)
  move() {
    if (this.saved || this.isOnBeach || !this.isLone) return;
    this.angle += (Math.random() - 0.5) * 0.1;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.x = Math.max(2, Math.min(18, this.x));
    this.y = Math.max(1.5, Math.min(9, this.y));
  }

  // сериализовать для отправки в интерфейс
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      size: this.size,
      health: Math.round(this.health),
      saved: this.saved,
      isOnBeach: this.isOnBeach,
      group: this.group,
      groupColor: this.groupColor,
      isLone: this.isLone,
      age: Math.round(this.age),
      maxAge: this.maxAge,
      deathReason: this.deathReason,
      event: this.event,
      eventName: this.eventName,
    };
  }
}