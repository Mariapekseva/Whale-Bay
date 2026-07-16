// ================================================================
// ФАЙЛ: Journal.js — журнал событий
// ================================================================

export class Journal {
  constructor() {
    this.entries = [];
  }

  // добавить событие
  log(type, message, entityId) {
    const time = new Date().toLocaleTimeString();
    this.entries.unshift({
      type: type,
      message: message,
      entityId: entityId || null,
      time: time,
      tick: 0,
    });
    if (this.entries.length > 100) this.entries.pop();
  }

  // получить последние N событий
  getRecent(n = 25) {
    return this.entries.slice(0, n);
  }

  // получить все события
  getAll() {
    return this.entries;
  }

  // очистить журнал
  clear() {
    this.entries = [];
  }
}