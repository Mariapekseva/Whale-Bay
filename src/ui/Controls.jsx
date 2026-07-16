// Controls.jsx - кнопки управления

import React from 'react';

export function Controls({ 
  isPaused,        // на паузе ли симуляция
  onTogglePause,   // переключить паузу
  onReset,         // сбросить симуляцию
  onSpeedChange,   // изменить скорость
  speed,           // текущая скорость (1, 2, 5)
  onHelp           // показать справку
}) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '8px 12px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      flexWrap: 'wrap',
      alignItems: 'center',
    }}>
      {/* кнопка паузы / возобновления */}
      <button
        onClick={onTogglePause}
        style={{
          padding: '6px 16px',
          background: isPaused ? '#4CAF50' : '#FF9800',
          border: 'none',
          borderRadius: '6px',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        {isPaused ? '▶ Старт' : '⏸ Пауза'}
      </button>

      {/* кнопка сброса */}
      <button
        onClick={onReset}
        style={{
          padding: '6px 16px',
          background: '#f44336',
          border: 'none',
          borderRadius: '6px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        🔄 Сброс
      </button>

      {/* кнопки выбора скорости */}
      {[1, 2, 5].map(s => (
        <button
          key={s}
          onClick={() => onSpeedChange(s)}
          style={{
            padding: '6px 14px',
            background: speed === s ? '#2196F3' : '#f0f2f5',
            border: 'none',
            borderRadius: '6px',
            color: speed === s ? 'white' : '#333',
            fontWeight: speed === s ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {s}×
        </button>
      ))}

      {/* кнопка справки */}
      <button
        onClick={onHelp}
        style={{
          padding: '6px 14px',
          background: '#FF9800',
          border: 'none',
          borderRadius: '6px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        ❓ Справка
      </button>
    </div>
  );
}