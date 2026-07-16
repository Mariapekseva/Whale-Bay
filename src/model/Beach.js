// главный класс - тут всё происходит

import { Whale } from './Whale.js';
import { Rescuer } from './Rescuer.js';
import { Volunteer } from './Volunteer.js';
import { Journal } from './Journal.js';

// настройки по умолчанию (если не загрузится конфиг)
const DEFAULT_CONFIG = {
  whales: {
    groups: {
      group1: { name: 'ГРУППА 1', count: 4, color: '#4FC3F7' },
      group2: { name: 'ГРУППА 2', count: 4, color: '#FF8A65' },
      loners: { name: 'ОДИНОЧКА', count: 2, color: '#A5D6A7' }
    },
    maxWhales: 20,
    birthInterval: { ideal: 15, bad: 30 },
    strandInterval: 80
  },
  rescuers: {
    names: ['Егор', 'Максим', 'Анна'],
    startX: 4,
    startY: 18,
    boatX: 9,
    boatY: 13.5
  },
  volunteers: {
    names: ['Денис', 'Ксения'],
    startX: 6,
    startY: 17
  },
  events: {
    list: [
      { id: 'shallow', name: 'Мелководье', damage: 8 },
      { id: 'reef', name: 'Рифы', damage: 10 },
      { id: 'hungry', name: 'Голод', damage: 6 },
      { id: 'trapped', name: 'Ловушка', damage: 15 },
      { id: 'poison', name: 'Химикаты', damage: 25 }
    ],
    interval: 15
  },
  environment: {
    food: 80,
    clean: true,
    warm: true
  }
};

export class Beach {
  constructor(config = null) {
    const cfg = config || DEFAULT_CONFIG;
    this.config = cfg;

    this.whales = [];              // все киты
    this.rescuers = [];            // спасатели
    this.volunteers = [];          // волонтёры
    this.deadWhales = [];          // умершие (для статистики)
    this.eventLog = [];            // журнал событий
    this.tick = 0;                 // номер текущего шага
    this.speed = 1;                // скорость (1×, 2×, 5×)
    this.birthCount = 0;           // сколько родилось
    this.maxWhales = cfg.whales.maxWhales || 20; // максимум китов

    // события - берем из конфиг
    this.EVENTS = cfg.events.list || [];
    this.eventEnabled = {};        // включены ли события (по умолчанию выключены)
    for (const e of this.EVENTS) {
      this.eventEnabled[e.id] = false;
    }

    // среда обитания
    this.env = {
      food: cfg.environment.food || 80,
      clean: cfg.environment.clean !== undefined ? cfg.environment.clean : true,
      warm: cfg.environment.warm !== undefined ? cfg.environment.warm : true,
    };

    // статистика по событиям
    this.eventStats = {};
    for (const e of this.EVENTS) {
      this.eventStats[e.id] = { total: 0, helped: 0, died: 0 };
    }

    // таймеры для рождения, выброса и событий
    this.birthTimer = 0;
    this.beachTimer = 0;
    this.eventTimer = 0;
    
    // журнал
    this.journal = new Journal();

    //  СОЗДАЮ КИТОВ ИЗ КОНФ 
    const groups = cfg.whales.groups;
    // группа 1
    for (let i = 0; i < groups.group1.count; i++) {
      const w = new Whale(3 + i * 3, 2 + Math.random() * 2);
      w.group = groups.group1.name;
      w.groupColor = groups.group1.color;
      this.whales.push(w);
    }
    // группа 2
    for (let i = 0; i < groups.group2.count; i++) {
      const w = new Whale(3 + i * 3, 6 + Math.random() * 2);
      w.group = groups.group2.name;
      w.groupColor = groups.group2.color;
      this.whales.push(w);
    }
    // одиночки
    for (let i = 0; i < groups.loners.count; i++) {
      const w = new Whale(5 + Math.random() * 10, 2 + Math.random() * 6);
      w.group = groups.loners.name;
      w.groupColor = groups.loners.color;
      w.isLone = true;
      this.whales.push(w);
    }

    //  СПАСАТЕЛИ 
    const rCfg = cfg.rescuers;
    for (let i = 0; i < rCfg.names.length; i++) {
      const isMale = rCfg.names[i] !== 'Анна';
      const r = new Rescuer(
        rCfg.startX + i * 4,
        rCfg.startY,
        rCfg.names[i],
        isMale ? 'male' : 'female'
      );
      r.boatX = rCfg.boatX;
      r.boatY = rCfg.boatY;
      this.rescuers.push(r);
    }

    //  ВОЛОНТЁРЫ 
    const vCfg = cfg.volunteers;
    for (let i = 0; i < vCfg.names.length; i++) {
      const v = new Volunteer(vCfg.startX + i * 6, vCfg.startY);
      v.name = vCfg.names[i];
      this.volunteers.push(v);
    }

    // первые записи в журнале
    this.journal.log('info', '🚀 Станция начала работу');
    this.journal.log('info', '🧑‍🤝‍🧑 Волонтёры на связи!');
  }

  // найти спасателя по id
  getRescuer(id) {
    return this.rescuers.find(r => r.id === id);
  }

  // найти кита по id
  getWhale(id) {
    return this.whales.find(w => w.id === id);
  }

  // обновить среду
  setEnv(env) {
    this.env = env;
  }

  // включить/выключить событие
  setEventEnabled(id, enabled) {
    this.eventEnabled[id] = enabled;
  }

  // проверить, идеальные ли условия
  isIdealConditions() {
    return this.env.warm && this.env.food > 50 && this.env.clean;
  }

  // есть ли включённые события
  hasEnabledEvents() {
    return Object.values(this.eventEnabled).some(v => v === true);
  }

  // очистить список умерших
  clearDeadWhales() {
    this.deadWhales = [];
  }

  // ОДИН ШАГ СИМУЛЯЦИИ 
  step() {
    this.tick++;
    this.birthTimer++;
    this.beachTimer++;
    this.eventTimer++;

    const ideal = this.isIdealConditions();
    const eventsOn = this.hasEnabledEvents();

    // 1. СТАРОСТЬ
    for (const w of this.whales) {
      if (w.saved || w.health === 0 || w.isOnBeach) continue;
      if (w.age > w.maxAge - 1 && Math.random() < 0.001 * this.speed) {
        w.health = 0;
        w.deathReason = 'старость';
        this.deadWhales.push({ name: w.name, reason: 'старость', age: Math.round(w.age) });
        this.journal.log('death', `${w.name} умер от старости (${Math.round(w.age)} лет)`, w.id);
      }
      if (Math.random() < 0.005) w.age += 0.1;
    }

    // 2. РОЖДЕНИЕ
    const alive = this.whales.filter(w => w.health > 0);
    if (alive.length < this.maxWhales) {
      let shouldBirth = false;

      if (eventsOn) {
        // если события включены — рождаемость почти нулевая
        if (Math.random() < 0.0001 * this.speed) {
          shouldBirth = true;
        }
      } else if (ideal) {
        // идеальные условия — каждые 15 тиков
        if (this.birthTimer >= 15 / this.speed) {
          shouldBirth = true;
          this.birthTimer = 0;
        }
      } else {
        // плохие условия — каждые 30 тиков
        if (this.birthTimer >= 30 / this.speed) {
          shouldBirth = true;
          this.birthTimer = 0;
        }
      }

      if (shouldBirth) {
        const parents = this.whales.filter(w => !w.isLone && w.health > 50 && !w.isOnBeach && w.age > 2);
        if (parents.length > 0) {
          const p = parents[Math.floor(Math.random() * parents.length)];
          const w = new Whale(p.x + (Math.random() - 0.5) * 2, p.y + (Math.random() - 0.5) * 2);
          w.group = p.group;
          w.health = 90 + Math.random() * 10;
          w.age = 0;
          this.whales.push(w);
          this.birthCount++;
          this.journal.log('birth', `🐣 Родился новый кит (${w.group})`, w.id);
        }
      }
    }

    // 3. ВЫБРОС НА БЕРЕГ
    const strandInterval = this.config.whales.strandInterval || 80;
    if (this.beachTimer >= strandInterval / this.speed) {
      this.beachTimer = 0;
      let count = ideal ? 1 : 2;
      if (eventsOn) count += 1;
      for (let i = 0; i < count; i++) {
        const healthy = this.whales.filter(w => !w.saved && !w.isOnBeach && w.health > 30);
        if (healthy.length > 0) {
          const whale = healthy[Math.floor(Math.random() * healthy.length)];
          whale.isOnBeach = true;
          whale.x = 3 + Math.random() * 14;
          whale.y = 11 + Math.random() * 2;
          whale.health = 30 + Math.random() * 20;
          this.journal.log('danger', `🚨 ${whale.name} выбросился на берег`, whale.id);
        }
      }
    }

    // 4. СОБЫТИЯ (если включены)
    if (eventsOn && this.eventTimer >= 10 / this.speed) {
      this.eventTimer = 0;
      const enabledEvents = this.EVENTS.filter(e => this.eventEnabled[e.id] === true);
      if (enabledEvents.length > 0) {
        // выбираем китов, у которых нет события (спасённые тоже могут заболеть)
        const targets = this.whales.filter(w => !w.isOnBeach && !w.event && w.health > 20);
        if (targets.length > 0) {
          // от 1 до 3 китов за раз
          const count = Math.min(1 + Math.floor(Math.random() * 3), targets.length);
          const shuffled = targets.sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, count);
          
          for (const whale of selected) {
            const e = enabledEvents[Math.floor(Math.random() * enabledEvents.length)];
            whale.event = e.id;
            whale.eventTimer = 30 + Math.floor(Math.random() * 30);
            whale.eventName = e.name;
            whale.saved = false; // сбрасываем статус спасённого
            this.eventStats[e.id].total++;
            this.eventLog.push({ whale: whale.name, event: e.name, status: 'active', tick: this.tick });
            this.journal.log('event', `⚠️ ${whale.name} попал в ${e.name}`, whale.id);
            // урон зависит от типа события
            let damage = e.damage || 0;
            if (e.id === 'poison') damage = 25;
            if (e.id === 'trapped') damage = 15;
            if (e.id === 'reef') damage = 12;
            if (e.id === 'shallow') damage = 10;
            if (e.id === 'hungry') damage = 10;
            whale.health -= damage;
          }
        }
      }
    }

    // 5. КИТЫ ПОД ВЛИЯНИЕМ СОБЫТИЙ
    for (const w of this.whales) {
      if (w.health === 0 || !w.event) continue;
      w.eventTimer--;
      w.health -= 0.5; // теряют здоровье каждый тик
      if (w.health <= 0) {
        w.health = 0;
        w.deathReason = w.event;
        this.deadWhales.push({ name: w.name, reason: w.event, age: Math.round(w.age) });
        this.eventStats[w.event].died++;
        this.journal.log('death', `💔 ${w.name} погиб от ${w.event}`, w.id);
        const entry = this.eventLog.find(e => e.whale === w.name && e.status === 'active');
        if (entry) entry.status = 'died';
        w.event = null;
        continue;
      }
      if (w.eventTimer <= 0 && w.health > 0) {
        // сам вылечился
        this.journal.log('info', `🍀 ${w.name} сам выбрался из ${w.event}`, w.id);
        const entry = this.eventLog.find(e => e.whale === w.name && e.status === 'active');
        if (entry) entry.status = 'self_resolved';
        w.event = null;
      }
    }

    // 6. КИТЫ НА БЕРЕГУ
    for (const w of this.whales) {
      if (w.health === 0) continue;
      if (w.isOnBeach) {
        w.health -= 0.02;
        if (w.health <= 0) {
          w.health = 0;
          w.deathReason = 'мель';
          this.deadWhales.push({ name: w.name, reason: 'мель', age: Math.round(w.age) });
          this.journal.log('death', `💔 ${w.name} погиб на мели`, w.id);
        }
      }
    }

    // 7. ОДИНОЧКИ ПЛАВАЮТ
    for (const w of this.whales) {
      if (w.isLone && !w.isOnBeach && !w.saved && w.health > 0) {
        w.move();
      }
    }

    // 8. ВОЛОНТЁРЫ — ищут китов в опасности
    for (const v of this.volunteers) {
      const target = v.findWhale(this.whales);
      if (target) {
        v.sendReport(target);
        const free = this.rescuers.find(r => r.state === 'idle');
        if (free) {
          free.goToBoat(target.id);
          this.journal.log('info', `📡 ${v.name}: ${v.message}`, target.id);
        }
      }
    }

    // 9. СПАСАТЕЛИ
    const needHelp = this.whales.filter(w => w.health > 0 && (w.event || w.isOnBeach));

    for (const r of this.rescuers) {
      if (r.state === 'idle' && needHelp.length > 0) {
        let target = null;
        let minDist = Infinity;
        for (const w of needHelp) {
          // проверяем, не занят ли кит другим спасателем
          const taken = this.rescuers.some(r2 => r2.targetId === w.id && r2.state !== 'idle' && r2.id !== r.id);
          if (taken) continue;
          const dist = Math.abs(w.x - r.x) + Math.abs(w.y - r.y);
          if (dist < minDist) {
            minDist = dist;
            target = w;
          }
        }
        if (target) {
          r.goToBoat(target.id);
          this.journal.log('info', `🚶 ${r.name} идёт к лодке (к ${target.name})`, r.id);
        }
        continue;
      }

      // идёт к лодке
      if (r.state === 'going') {
        const arrived = r.stepTo(r.boatX, r.boatY);
        if (arrived) {
          r.state = 'on_boat';
          r.isOnBoat = true;
          this.journal.log('info', `🚣 ${r.name} сел в лодку`, r.id);
        }
        continue;
      }

      // на лодке - плывёт к киту
      if (r.state === 'on_boat') {
        const target = this.whales.find(w => w.id === r.targetId);
        if (!target || target.health === 0 || (!target.event && !target.isOnBeach)) {
          r.goHome();
          this.journal.log('info', `🔙 ${r.name} возвращается`, r.id);
        } else {
          r.state = 'helping';
          r.helpTicks = 0;
        }
        continue;
      }

      // помогает киту
      if (r.state === 'helping') {
        const target = this.whales.find(w => w.id === r.targetId);
        if (!target || target.health === 0 || (!target.event && !target.isOnBeach)) {
          r.goHome();
          this.journal.log('info', `🔙 ${r.name} возвращается`, r.id);
          continue;
        }

        const arrived = r.stepTo(target.x, target.y);
        if (!arrived) continue;

        r.helpTicks++;
        if (r.helpTicks % 2 === 0) {
          target.health = Math.min(100, target.health + 2); // лечим
          if (target.health >= 80) { // если здоровье поднялось до 80% — спасён
            target.saved = true;
            let msg = '';
            if (target.event) {
              const eventId = target.event;
              target.event = null;
              target.eventName = null;
              this.eventStats[eventId].helped++;
              const entry = this.eventLog.find(e => e.whale === target.name && e.status === 'active');
              if (entry) entry.status = 'helped';
              msg = ` (${eventId})`;
            }
            if (target.isOnBeach) {
              target.isOnBeach = false;
              target.x = 3 + Math.random() * 14;
              target.y = 2 + Math.random() * 6;
              msg = ' (с мели)';
            }
            r.rescuedCount++;
            r.whalesSaved++;
            this.journal.log('rescue', `✅ ${r.name} вылечил ${target.name}${msg} (${r.rescuedCount}/3)`, target.id);
            if (r.rescuedCount >= 3) {
              r.goHome();
              this.journal.log('info', `📋 ${r.name} вернулся на базу (3 помощи)`, r.id);
            } else {
              const nextHelp = this.whales.filter(w => 
                w.health > 0 && (w.event || w.isOnBeach) &&
                !this.rescuers.some(r2 => r2.targetId === w.id && r2.state !== 'idle')
              );
              if (nextHelp.length > 0) {
                let closest = null;
                let minDist = Infinity;
                for (const w of nextHelp) {
                  const dist = Math.abs(w.x - r.x) + Math.abs(w.y - r.y);
                  if (dist < minDist) {
                    minDist = dist;
                    closest = w;
                  }
                }
                if (closest) {
                  r.targetId = closest.id;
                  r.state = 'on_boat';
                } else {
                  r.goHome();
                }
              } else {
                r.goHome();
              }
            }
          }
        }
        continue;
      }

      // возвращается на базу
      if (r.state === 'returning') {
        const arrived = r.stepTo(r.homeX, r.homeY);
        if (arrived) {
          r.x = r.homeX;
          r.y = r.homeY;
          r.isOnBoat = false;
          r.rescuedCount = 0;
          r.targetId = null;
          r.state = 'idle';
          r.helpTicks = 0;
          this.journal.log('info', `🏠 ${r.name} вернулся на базу`, r.id);
        }
        continue;
      }
    }

    // 10. УДАЛЯЕМ МЁРТВЫХ
    this.whales = this.whales.filter(w => w.health > 0 || w.saved);
    
    // 11. ЕСЛИ КИТОВ МЕНЬШЕ 3 — ДОБАВЛЯЕМ НОВЫХ (чтобы не вымирали)
    const aliveCount = this.whales.filter(w => w.health > 0).length;
    if (aliveCount < 3 && this.whales.length < this.maxWhales) {
      for (let i = 0; i < 3 - aliveCount; i++) {
        const w = new Whale(
          3 + Math.random() * 14,
          2 + Math.random() * 6
        );
        const groups = ['ГРУППА 1', 'ГРУППА 2', 'ОДИНОЧКА'];
        w.group = groups[Math.floor(Math.random() * groups.length)];
        if (w.group === 'ОДИНОЧКА') w.isLone = true;
        w.health = 80 + Math.random() * 20;
        this.whales.push(w);
        this.journal.log('birth', `🐣 Новый кит появился (${w.group})`, w.id);
      }
    }
  }

  // собрать данные для интерфейса
  getSnapshot() {
    const alive = this.whales.filter(w => w.health > 0);
    const saved = this.whales.filter(w => w.saved);
    const total = alive.length + saved.length + this.deadWhales.length;

    return {
      whales: this.whales.map(w => w.toJSON()),
      rescuers: this.rescuers.map(r => r.toJSON()),
      volunteers: this.volunteers.map(v => v.toJSON()),
      baseRescuers: this.rescuers.filter(r => r.state === 'idle').map(r => r.toJSON()),
      events: this.journal.getRecent(30),
      birthCount: this.birthCount,
      deadWhales: this.deadWhales.slice(-15),
      eventLog: this.eventLog.slice(-20),
      eventStats: this.eventStats,
      stats: {
        total: total,
        alive: alive.length,
        saved: saved.length,
        dead: this.deadWhales.length,
        inDanger: this.whales.filter(w => w.isOnBeach && w.health > 0).length,
        healthy: alive.filter(w => !w.isOnBeach && !w.event).length,
        withEvents: alive.filter(w => w.event).length,
      },
    };
  }
}