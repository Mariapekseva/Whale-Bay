import React, { useState } from 'react';

export function StatsPanel({ snapshot, onWhaleClick }) {
  const [tab, setTab] = useState('whales');  // активная вкладка

  if (!snapshot) return <div>Загрузка...</div>;

  return (
    <div style={{
      width: '280px',
      minWidth: '220px',
      height: '100%',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* заголовок */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#1a237e' }}>🐋 Китовый пляж</h2>
      </div>

      {/* вкладки */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
        {[
          { id: 'whales', label: '🐋 Киты' },
          { id: 'rescuers', label: '🚤 Спасатели' },
          { id: 'events', label: '💬 События' },
        ].map(b => (
          <button
            key={b.id}
            onClick={() => setTab(b.id)}
            style={{
              flex: 1,
              padding: '10px 6px',
              background: tab === b.id ? '#e3f2fd' : 'transparent',
              border: 'none',
              borderBottom: tab === b.id ? '3px solid #2196F3' : 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: tab === b.id ? 'bold' : 'normal',
              color: tab === b.id ? '#1a237e' : '#666',
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* содержимое вкладок */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {tab === 'whales' && (
          <div>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
              {snapshot.stats.inDanger} в опасности · {snapshot.stats.saved} спасены
            </div>
            {snapshot.whales.map(w => {
              // определяем статус кита
              const status = w.saved ? '✅ Спасён' :
                            w.health === 0 ? '💔 Погиб' :
                            `❤️ ${Math.round(w.health)}%`;
              return (
                <div
                  key={w.id}
                  onClick={() => onWhaleClick(w.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    marginBottom: '6px',
                    background: w.saved ? '#e8f5e9' : (w.health === 0 ? '#ffebee' : 'transparent'),
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '1px solid transparent',
                  }}
                >
                  <span>{w.saved ? '🐬' : (w.health === 0 ? '💀' : '🐋')}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{w.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'rescuers' && (
          <div>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
              {snapshot.rescuers.length} спасателей
            </div>
            {snapshot.rescuers.map(r => {
              // статусы спасателей
              const stateMap = { idle: '🟢 На базе', going: '🟡 В пути', returning: '🔙 Возвращается' };
              return (
                <div key={r.id} style={{ padding: '8px 12px', marginBottom: '6px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>🚤 {r.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{stateMap[r.state] || r.state}</div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'events' && (
          <div>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
              Последние события
            </div>
            {snapshot.events.map((e, i) => (
              <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f5f5f5', fontSize: '13px' }}>
                {e.icon} {e.message}
              </div>
            ))}
            {snapshot.events.length === 0 && <div style={{ color: '#999' }}>Событий пока нет</div>}
          </div>
        )}
      </div>
    </div>
  );
}