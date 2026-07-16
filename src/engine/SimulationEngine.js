// движок — запускает таймер и управляет симуляцией

import { Beach } from "../model/Beach.js";
import { Mover } from './Mover.js';

export class SimulationEngine {
  constructor(config, onSnapshot) {
    this.config = config;                // настройки
    this.onSnapshot = onSnapshot;        // функция для отправки данных в интерфейс
    this.isRunning = false;              // запущена ли симуляция
    this.isPaused = false;               // на паузе ли
    this.speed = 1;                      // скорость (1×, 2×, 5×)
    this.tickCounter = 0;                // счётчик тиков
    this.timerId = null;                 // id основного таймера
    this.snapshotTimerId = null;         // id таймера для отправки данных

    this.beach = new Beach(config, Mover); // создаём пляж
  }

  // запустить симуляцию
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;

    // основной таймер — каждый тик обновляет симуляцию
    this.timerId = setInterval(() => {
      if (this.isPaused) return;
      this._tick();
    }, 500 / this.speed);

    // таймер для отправки снимка в интерфейс 
    this.snapshotTimerId = setInterval(() => {
      this._sendSnapshot();
    }, 150);
  }

  // остановить симуляцию
  stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.snapshotTimerId) {
      clearInterval(this.snapshotTimerId);
      this.snapshotTimerId = null;
    }
  }

  // поставить на паузу
  pause() {
    this.isPaused = true;
  }

  // продолжить после паузы
  resume() {
    this.isPaused = false;
  }

  // изменить скорость
  setSpeed(speed) {
    this.speed = speed;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  // перезапустить симуляцию
  reset() {
    this.stop();
    this.beach = new Beach(this.config, Mover);
    this.tickCounter = 0;
    this.isPaused = false;
    this.start();
  }

  // один шаг симуляции
  _tick() {
    this.tickCounter++;
    const finished = this.beach.tick(); // обновляем пляж
    if (finished) {
      this.pause();                    // если все киты спасены или погибли — ставим на паузу
      this._sendSnapshot();
    }
  }

  // отправить снимок состояния в интерфейс
  _sendSnapshot() {
    if (this.onSnapshot) {
      const snapshot = this.beach.toSnapshot();
      this.onSnapshot({
        tick: this.tickCounter,
        ...snapshot,
      });
    }
  }

  // уничтожить движок (при выходе)
  destroy() {
    this.stop();
  }

  // найти объект по id для инспектора
  inspect(entityId) {
    for (const whale of this.beach.whales.values()) {
      if (whale.id === entityId) {
        return { type: 'whale', data: whale.toInspectable() };
      }
    }
    for (const vol of this.beach.volunteers.values()) {
      if (vol.id === entityId) {
        return { type: 'volunteer', data: vol.toInspectable() };
      }
    }
    for (const rescuer of this.beach.rescuers.values()) {
      if (rescuer.id === entityId) {
        return { type: 'rescuer', data: rescuer.toInspectable() };
      }
    }
    if (this.beach.base && this.beach.base.id === entityId) {
      return { type: 'base', data: this.beach.base.toInspectable() };
    }
    return null;
  }
}