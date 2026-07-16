import React, { useState, useEffect } from 'react';
import './App.css';
import { Beach } from './model/Beach.js';
import { BeachGrid } from './ui/BeachGrid.jsx';
import { Controls } from './ui/Controls.jsx';
import { EntityInspector } from './ui/EntityInspector.jsx';

const CONFIG_URL = '/beach_config.json';

function App() {
  // состояние приложения
  const [beach, setBeach] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [tab, setTab] = useState('whales');
  const [showHelp, setShowHelp] = useState(false);
  const [showBaseInfo, setShowBaseInfo] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // настройки событий
  const [eventSettings, setEventSettings] = useState({
    shallow: false,
    reef: false,
    hungry: false,
    trapped: false,
    poison: false,
  });

  // параметры среды
  const [env, setEnv] = useState({
    food: 80,
    clean: true,
    warm: true,
  });

  // загрузка конфига при старте
  useEffect(() => {
    fetch(CONFIG_URL)
      .then(res => {
        if (!res.ok) {
          throw new Error('Файл не найден');
        }
        return res.json();
      })
      .then(config => {
        console.log('✅ Конфиг загружен:', config);
        const newBeach = new Beach(config);
        setBeach(newBeach);
        setSnapshot(newBeach.getSnapshot());
        setEnv({
          food: config.environment.food || 80,
          clean: config.environment.clean !== undefined ? config.environment.clean : true,
          warm: config.environment.warm !== undefined ? config.environment.warm : true,
        });
        // инициализация событий из конфига
        const newEventSettings = {};
        for (const e of config.events.list || []) {
          newEventSettings[e.id] = false;
        }
        setEventSettings(newEventSettings);
      })
      .catch(err => {
        console.warn('⚠️ Конфиг не загружен, использую дефолтный:', err);
        const newBeach = new Beach();
        setBeach(newBeach);
        setSnapshot(newBeach.getSnapshot());
      });
  }, []);

  // таймер симуляции
  useEffect(() => {
    if (!beach) return;
    const interval = setInterval(() => {
      if (!isPaused) {
        beach.speed = speed;
        beach.setEnv(env);
        beach.step();
        setSnapshot(beach.getSnapshot());
      }
    }, 150 / speed);
    return () => clearInterval(interval);
  }, [speed, beach, env, isPaused]);

  // переключение паузы
  const togglePause = () => setIsPaused(!isPaused);

  // сброс симуляции
  const resetAll = () => window.location.reload();

  // смена скорости
  const changeSpeed = (s) => setSpeed(s);

  // включить/выключить событие
  const toggleEvent = (id) => {
    setEventSettings(prev => ({ ...prev, [id]: !prev[id] }));
    if (beach) beach.setEventEnabled(id, !eventSettings[id]);
  };

  // изменить параметр среды
  const changeEnv = (key, val) => {
    setEnv(prev => ({ ...prev, [key]: val }));
  };

  // клик по объекту (кит или спасатель)
  const handleEntityClick = (id) => {
    if (!beach) return;
    let entity = beach.getWhale(id);
    if (entity) {
      setSelectedEntity(entity);
      return;
    }
    entity = beach.getRescuer(id);
    if (entity) {
      setSelectedEntity(entity);
      return;
    }
  };

  // клик по базе
  const handleBaseClick = () => setShowBaseInfo(true);

  // если данные не загружены
  if (!snapshot || !beach) {
    return <div style={{ padding: '40px', fontSize: '20px' }}>🐋 Загрузка...</div>;
  }

  const baseRescuers = snapshot.baseRescuers || [];
  const volunteers = snapshot.volunteers || [];

  return (
    <div className="app-container">
      {/* левая панель */}
      <div className="left-panel">
        <h2 className="panel-title">🐋 Китовый залив</h2>

        {/* вкладки */}
        <div className="tab-buttons">
          <button className={`tab-btn ${tab === 'whales' ? 'active' : ''}`} onClick={() => setTab('whales')}>🐋 Киты</button>
          <button className={`tab-btn ${tab === 'rescuers' ? 'active' : ''}`} onClick={() => setTab('rescuers')}>🚤 Спасатели</button>
          <button className={`tab-btn ${tab === 'volunteers' ? 'active' : ''}`} onClick={() => setTab('volunteers')}>🧑‍🤝‍🧑 Волонтёры</button>
          <button className={`tab-btn ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>💬 События</button>
          <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>📊 Статистика</button>
        </div>

        {/* содержимое вкладок */}
        <div className="tab-content">
          {/* вкладка КИТЫ */}
          {tab === 'whales' && (
            <div>
              <div className="tab-info">
                🟢 Здоровых: {snapshot.stats.healthy} &nbsp;|&nbsp; 🟠 В опасности: {snapshot.stats.inDanger} &nbsp;|&nbsp; ✅ Спасено: {snapshot.stats.saved}
              </div>
              {snapshot.whales.filter(w => w.health > 0).map(w => {
                let status = '';
                let emoji = '🐋';
                if (w.saved) { 
                  status = '✅ Спасён'; 
                  emoji = '🐬'; 
                } else if (w.isOnBeach && w.health < 30) { 
                  status = '🚨 Опасно!'; 
                  emoji = '🔴'; 
                } else if (w.isOnBeach) { 
                  status = `🏖️ На берегу ${w.health}%`; 
                } else if (w.event) {
                  const eventNames = {
                    'shallow': '🌊 Мелководье',
                    'reef': '🪸 Рифы',
                    'hungry': '🐟 Голод',
                    'trapped': '🕸️ Ловушка',
                    'poison': '☣️ Химикаты'
                  };
                  status = `⚠️ ${eventNames[w.event] || w.event}`;
                } else { 
                  status = `🌊 В океане ${w.health}%`; 
                }
                return (
                  <div 
                    key={w.id} 
                    className={`whale-item ${w.isOnBeach && w.health < 30 ? 'danger' : ''} ${w.saved ? 'saved' : ''}`} 
                    onClick={() => handleEntityClick(w.id)}
                  >
                    <span className="whale-emoji">{emoji}</span>
                    <div className="whale-info">
                      <div className="whale-name">{w.name}</div>
                      <div className="whale-status">{status}</div>
                      <div style={{ fontSize: '9px', color: w.groupColor || '#888' }}>{w.group || '—'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* вкладка СПАСАТЕЛИ */}
          {tab === 'rescuers' && (
            <div>
              <div className="tab-info">🚤 {snapshot.rescuers.length} спасателей &nbsp;|&nbsp; 🏠 На базе: {baseRescuers.length}</div>
              {snapshot.rescuers.map(r => {
                const stateMap = {
                  idle: '🟢 На базе',
                  going: '🚶 Идёт к лодке',
                  on_boat: '⛵ На лодке',
                  helping: '🤝 Помогает киту',
                  returning: '🔙 Возвращается на базу'
                };
                const emoji = r.gender === 'male' ? '👨' : '👩';
                return (
                  <div 
                    key={r.id} 
                    className="rescuer-item" 
                    onClick={() => handleEntityClick(r.id)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="rescuer-name">{emoji} {r.name}</div>
                    <div className="rescuer-status">{stateMap[r.state] || r.state}</div>
                    {r.rescuedCount > 0 && <div style={{ fontSize: '10px', color: '#FF6D00' }}>Спас за рейс: {r.rescuedCount}/3</div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* вкладка ВОЛОНТЁРЫ */}
          {tab === 'volunteers' && (
            <div>
              <div className="tab-info">🧑‍🤝‍🧑 {volunteers.length} волонтёров на базе</div>
              {volunteers.map(v => (
                <div key={v.id} className="rescuer-item">
                  <div className="rescuer-name">🧑‍🤝‍🧑 {v.name}</div>
                  <div className="rescuer-status" style={{ fontSize: '12px', color: '#888' }}>{v.message || '🟢 Ожидает'}</div>
                  {v.targetId && <div style={{ fontSize: '10px', color: '#FF6D00', marginTop: '4px' }}>📍 Отправляет координаты</div>}
                </div>
              ))}
            </div>
          )}

          {/* вкладка СОБЫТИЯ */}
          {tab === 'events' && (
            <div>
              <div className="tab-info">📋 Последние события</div>
              {snapshot.events.length === 0 ? <div className="empty-msg">Событий пока нет</div> : (
                snapshot.events.map((e, i) => (
                  <div key={i} className="event-item">
                    <span className="event-icon">{e.icon}</span>
                    <span className="event-text">{e.message}</span>
                    <span className="event-time">{e.time}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* вкладка СТАТИСТИКА */}
          {tab === 'stats' && (
            <div>
              <div className="tab-info">📊 Общая статистика</div>
              <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                <div>🐋 Всего: {snapshot.stats.total}</div>
                <div>🐋 Живых: {snapshot.stats.alive}</div>
                <div>✅ Спасено: {snapshot.stats.saved}</div>
                <div>💔 Погибло: {snapshot.stats.dead}</div>
                <div>🐣 Родилось: {snapshot.birthCount || 0}</div>
              </div>

              <div className="tab-info">📋 Таблица событий</div>
              {snapshot.eventLog && snapshot.eventLog.length > 0 ? (
                snapshot.eventLog.map((entry, i) => {
                  const statusMap = { 
                    'active': '⚠️ Активно', 
                    'helped': '✅ Спасён', 
                    'self_resolved': '🍀 Выбрался сам', 
                    'died': '💔 Погиб' 
                  };
                  return <div key={i} style={{ padding: '2px 0', borderBottom: '1px solid #f0f0f0' }}>
                    {entry.whale} — {entry.event} — {statusMap[entry.status] || entry.status}
                  </div>;
                })
              ) : <div style={{ fontSize: '12px', color: '#999' }}>Пока нет</div>}

              <div className="tab-info">⚠️ Влияние на китов</div>
              {snapshot.eventStats && Object.entries(snapshot.eventStats).map(([key, val]) => {
                const names = { 
                  shallow: '🌊 Мелководье', 
                  reef: '🪸 Рифы', 
                  hungry: '🐟 Голод', 
                  trapped: '🕸️ Ловушка', 
                  poison: '☣️ Химикаты' 
                };
                return <div key={key} style={{ padding: '2px 0', borderBottom: '1px solid #f0f0f0' }}>
                  {names[key] || key}: {val.total} случаев, 💚 {val.helped} спасено, 💔 {val.died} погибло
                </div>;
              })}

              <div className="tab-info">💔 Умершие</div>
              {snapshot.deadWhales && snapshot.deadWhales.length > 0 ? (
                snapshot.deadWhales.map((w, i) => 
                  <div key={i} style={{ fontSize: '12px', padding: '3px 0', borderBottom: '1px solid #f0f0f0', color: '#999' }}>
                    {w.name} — {w.reason} ({w.age || 0} лет)
                  </div>
                )
              ) : <div style={{ fontSize: '12px', color: '#999' }}>Пока нет</div>}
            </div>
          )}
        </div>

        {/* краткая статистика внизу */}
        <div className="bottom-stats">
          <div>🐋 Живых: {snapshot.stats.alive}</div>
          <div>✅ Спасено: {snapshot.stats.saved}</div>
          <div>💔 Погибло: {snapshot.stats.dead}</div>
          <div>🐣 Родилось: {snapshot.birthCount || 0}</div>
        </div>
      </div>

      {/* центральная панель */}
      <div className="center-panel">
        <BeachGrid snapshot={snapshot} onWhaleClick={handleEntityClick} onBaseClick={handleBaseClick} />
        <Controls
          isPaused={isPaused}
          onTogglePause={togglePause}
          onReset={resetAll}
          onSpeedChange={changeSpeed}
          speed={speed}
          onHelp={() => setShowHelp(!showHelp)}
          birthCount={snapshot.birthCount || 0}
        />
      </div>

      {/* правая панель */}
      <div className="right-panel">
        {/* инспектор выбранного объекта */}
        <EntityInspector entity={selectedEntity} onClose={() => setSelectedEntity(null)} />

        {/* панель управления */}
        <div className="panel control-panel">
          <h3 className="panel-title">🎮 Управление</h3>
          <div className="control-section">
            <div className="control-label">⚠️ События</div>
            {Object.entries(eventSettings).map(([id, checked]) => {
              const names = { 
                shallow: '🌊 Мелководье', 
                reef: '🪸 Рифы', 
                hungry: '🐟 Голод', 
                trapped: '🕸️ Ловушка', 
                poison: '☣️ Химикаты' 
              };
              return (
                <div key={id} className="event-toggle">
                  <label className="switch small">
                    <input type="checkbox" checked={checked} onChange={() => toggleEvent(id)} />
                    <span className="slider"></span>
                  </label>
                  <span>{names[id] || id}</span>
                </div>
              );
            })}
          </div>
          <div className="control-section">
            <div className="control-label">🌍 Среда</div>
            <div className="env-row">
              <span>🐟 Еда:</span>
              <input type="range" min="0" max="100" value={env.food} onChange={(e) => changeEnv('food', parseInt(e.target.value))} />
              <span>{env.food}%</span>
            </div>
            <div className="env-row">
              <span>💧 Чистая вода:</span>
              <label className="switch small">
                <input type="checkbox" checked={env.clean} onChange={() => changeEnv('clean', !env.clean)} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="env-row">
              <span>🌡️ Тепло:</span>
              <label className="switch small">
                <input type="checkbox" checked={env.warm} onChange={() => changeEnv('warm', !env.warm)} />
                <span className="slider"></span>
              </label>
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
              💡 Чем лучше среда — тем чаще рождаются киты
            </div>
          </div>
        </div>

        {/* информация о базе */}
        <div className="panel" style={{ cursor: 'pointer' }} onClick={handleBaseClick}>
          <h3 className="panel-title">🏠 База</h3>
          <div>На базе: {baseRescuers.length} чел.</div>
          <div style={{ fontSize: '12px', color: '#888' }}>👆 Кликни для подробностей</div>
        </div>
      </div>

      {/* модалка с информацией о базе */}
      {showBaseInfo && (
        <div className="help-overlay" onClick={() => setShowBaseInfo(false)}>
          <div className="help-content" onClick={(e) => e.stopPropagation()}>
            <h2>🏠 База спасателей</h2>
            <p><strong>На базе:</strong> {baseRescuers.length} чел.</p>
            {baseRescuers.length > 0 ? (
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                {baseRescuers.map(r => <li key={r.id}>{r.gender === 'male' ? '👨' : '👩'} {r.name}</li>)}
              </ul>
            ) : <p style={{ color: '#999' }}>Все на задании</p>}
            <p style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
              🚣 Всего спасено: {snapshot.rescuers.reduce((sum, r) => sum + (r.whalesSaved || 0), 0)}
            </p>
            <p style={{ fontSize: '13px', color: '#666' }}>🐣 Родилось китов: {snapshot.birthCount || 0}</p>
            <button onClick={() => setShowBaseInfo(false)}>Закрыть</button>
          </div>
        </div>
      )}

      {/* модалка со справкой */}
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-content" onClick={(e) => e.stopPropagation()}>
            <h2>🐋 О симуляции</h2>
            <p>Симуляция спасательной операции в Китовом заливе.</p>
            <ul>
              <li>🐋 Киты живут группами. Одиночки плавают свободно.</li>
              <li>⚠️ На китов влияют случайные события.</li>
              <li>🧑‍✈️ Спасатели помогают китам.</li>
              <li>✅ Один спасатель может помочь 3 китам за выезд.</li>
              <li>🐣 Киты рождаются в хорошей среде.</li>
              <li>🧑‍🤝‍🧑 Волонтёры отправляют координаты спасателям.</li>
            </ul>
            <p><strong>Управление:</strong></p>
            <ul>
              <li>⏸ Пауза / ▶ Возобновление — остановить или продолжить симуляцию.</li>
              <li>🔄 Сброс — начать заново.</li>
              <li>1×, 2×, 5× — ускорить симуляцию.</li>
              <li>👆 Клик на кита — посмотреть информацию.</li>
              <li>🏠 Клик на базу — посмотреть кто на базе.</li>
            </ul>
            <button onClick={() => setShowHelp(false)}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;