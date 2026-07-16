import React from 'react';

export function EntityInspector({ entity, onClose }) {
  if (!entity) return null;

  // ЕСЛИ ЭТО СПАСАТЕЛЬ
  if (entity.rescuedCount !== undefined || entity.gender !== undefined) {
    const stateMap = {
      idle: 'На базе',
      going: 'Идёт к лодке',
      on_boat: 'На лодке',
      sailing: 'Плывёт к киту',
      helping: 'Помогает киту',
      returning: 'Возвращается на базу'
    };
    const emoji = entity.gender === 'male' ? '👨' : '👩';
    return (
      <div className="help-overlay" onClick={onClose}>
        <div className="help-content" onClick={(e) => e.stopPropagation()}>
          <h2>{emoji} {entity.name}</h2>
          <p><strong>Пол:</strong> {entity.gender === 'male' ? 'Мужской' : 'Женский'}</p>
          <p><strong>Состояние:</strong> {stateMap[entity.state] || entity.state}</p>
          <p><strong>Спас за рейс:</strong> {entity.rescuedCount || 0}/3</p>
          <p><strong>Всего спасений:</strong> {entity.whalesSaved || 0}</p>
          <button onClick={onClose}>Закрыть</button>
        </div>
      </div>
    );
  }

  // ЕСЛИ ЭТО КИТ
  return (
    <div className="help-overlay" onClick={onClose}>
      <div className="help-content" onClick={(e) => e.stopPropagation()}>
        <h2>{entity.saved ? '🐬' : (entity.isOnBeach && entity.health < 30 ? '🔴' : '🐋')} {entity.name}</h2>
        <p><strong>Здоровье:</strong> {entity.health}%</p>
        <p><strong>Размер:</strong> {Math.round(entity.size)}</p>
        <p><strong>Возраст:</strong> {entity.age} лет</p>
        <p><strong>Помощи получено:</strong> {entity.helpCount} раз</p>
        <p><strong>Группа:</strong> {entity.group || '—'}</p>
        <p><strong>Статус:</strong> {entity.saved ? '✅ Спасён' : (entity.isOnBeach ? '🏖️ На берегу' : '🌊 В океане')}</p>
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}