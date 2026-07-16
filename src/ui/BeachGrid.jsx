// рисуем пляж
import React, { useRef, useEffect } from 'react';

const CELL = 40;                         // размер одной клетки в пикселях
const GRID = 20;                         // размер сетки 20x20

// острова и рифы в океане
const ISLANDS = [
  { x: 1.5, y: 3.7, color: '#729473' },
  { x: 2, y: 4.3, color: '#81C784' },
  { x: 2.7, y: 4, color: '#3a7d3d' },
  { x: 8, y: 3, color: '#81C784' },
  { x: 13, y: 4, color: '#66BB6A' },
  { x: 14, y: 3, color: '#81C784' },
  { x: 17, y: 2, color: '#66BB6A' },
  { x: 2, y: 3, color: '#66BB6A' },
];

const REEFS = [
  { x: 4, y: 5, color: '#8D8D8D' },
  { x: 5, y: 6, color: '#9E9E9E' },
  { x: 4.5, y: 4.5, color: '#474646' },
  { x: 12, y: 6, color: '#9E9E9E' },
  { x: 16, y: 5, color: '#8D8D8D' },
  { x: 19, y: 9, color: '#8D8D8D' },
  { x: 19, y: 9.8, color: '#9E9E9E' },
  { x: 19, y: 10.7, color: '#474646' },
  { x: 18.7, y: 9, color: '#9E9E9E' },
  { x: 16, y: 8.8, color: '#8D8D8D' },
  { x: 19, y: 7.9, color: '#8D8D8D' },
  { x: 18, y: 9.8, color: '#9E9E9E' },
  { x: 18, y: 8.7, color: '#474646' },
  { x: 17, y: 9, color: '#9E9E9E' },
  { x: 17.8, y: 9.5, color: '#8D8D8D' },
  { x: 15, y: 10, color: '#474646' },
  { x: 15.5, y: 8.5, color: '#474646' },
  { x: 15.3, y: 9.5, color: '#807d7d' },
];

export function BeachGrid({ snapshot, onWhaleClick, onBaseClick }) {
  const canvasRef = useRef(null);

  // перерисовка при изменении snapshot
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !snapshot) return;
    const ctx = canvas.getContext('2d');
    const W = GRID * CELL;
    const H = GRID * CELL;
    canvas.width = W;
    canvas.height = H;

    const waterLine = 15;                // линия берега (y=15)

    //  ОКЕАН 
    ctx.fillStyle = '#6BB3E8';
    ctx.fillRect(0, 0, W, waterLine * CELL);

    //  ОСТРОВА 
    for (const island of ISLANDS) {
      ctx.fillStyle = island.color;
      ctx.fillRect(island.x * CELL + 4, island.y * CELL + 4, CELL - 8, CELL - 8);
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 1;
      ctx.strokeRect(island.x * CELL + 4, island.y * CELL + 4, CELL - 8, CELL - 8);
    }

    //  РИФЫ 
    for (const reef of REEFS) {
      ctx.fillStyle = reef.color;
      ctx.fillRect(reef.x * CELL + 6, reef.y * CELL + 6, CELL - 12, CELL - 12);
      ctx.strokeStyle = '#757575';
      ctx.lineWidth = 1;
      ctx.strokeRect(reef.x * CELL + 6, reef.y * CELL + 6, CELL - 12, CELL - 12);
    }

    //  ПЕСОК 
    for (let y = Math.floor(waterLine) + 1; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        ctx.fillStyle = '#fcd5ab';
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        ctx.strokeStyle = 'rgba(132, 98, 98, 0.05)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    // КОМПАС 
    const compasX = 20;
    const compasY = 20;
    ctx.save();
    ctx.translate(compasX, compasY);
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();
    ctx.strokeStyle = '#ede8e8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-4, 2);
    ctx.lineTo(0, -2);
    ctx.lineTo(4, 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.font = '7px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('N', 0, -12);
    ctx.restore();

    //  СЕТКА 
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, Math.floor(waterLine) * CELL);
      ctx.lineTo(x * CELL, GRID * CELL);
      ctx.stroke();
    }
    for (let y = Math.floor(waterLine) + 1; y <= GRID; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(GRID * CELL, y * CELL);
      ctx.stroke();
    }

    //  ПАЛЬМЫ 
    const palms = [
      { x: 1, y: 16.9 }, { x: 2, y: 18 }, { x: 4, y: 17 },
      { x: 17, y: 18.5 }, { x: 16, y: 17 }, { x: 18, y: 18 }
    ];
    for (const palm of palms) {
      const cx = palm.x * CELL + CELL/2;
      const cy = palm.y * CELL + CELL/2;
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('🌴', cx, cy + 4);
    }

    //  КАМНИ 
    const rocks = [
      { x: 0.5, y: 15.5 }, { x: 5, y: 19.5 }, 
      { x: 16, y: 15 }, { x: 18, y: 19 },
      { x: 8, y: 17 }, { x: 13, y: 17 },
    ];
    for (const rock of rocks) {
      const cx = rock.x * CELL + CELL/2;
      const cy = rock.y * CELL + CELL/2;
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('🪨', cx, cy + 4);
    }

    //  БАЗА 
    const bx = 9 * CELL;
    const by = 18 * CELL;
    const size = CELL * 1.5;
    
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#E53935';
    ctx.shadowBlur = 4;
    ctx.fillRect(bx, by, size, size);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, size, size);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('БАЗА', bx + CELL, by - 2);

    //  ПРИЧАЛ 
    const pierX = 9;
    const pierY = 15.8;
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect((pierX - 1) * CELL, pierY * CELL, 3 * CELL, 4);
    ctx.fillStyle = '#A1887F';
    ctx.fillRect((pierX - 1) * CELL + 2, pierY * CELL + 2, 3 * CELL - 4, 2);
    ctx.fillRect((pierX - 1) * CELL + 2, pierY * CELL + 6, 3 * CELL - 4, 2);

    //  ЛОДКИ 
    const boats = [
      { x: 7, y: 15 },
      { x: 9, y: 14.5 },
      { x: 11, y: 15 }
    ];
    for (const boat of boats) {
      ctx.font = '26px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('⛵', boat.x * CELL + CELL/2, boat.y * CELL + CELL);
    }

    // КИТЫ 
    for (const whale of snapshot.whales) {
      const cx = whale.x * CELL + CELL/2;
      const cy = whale.y * CELL + CELL/2;
      const radius = whale.size * 0.3;

      if (whale.health === 0) continue;

      // спасённые киты полупрозрачные
      if (whale.saved) {
        ctx.globalAlpha = 0.4;
        ctx.font = `${radius * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐳', cx, cy);
        ctx.globalAlpha = 1;
        continue;
      }

      // опасность: киты на мели с малым здоровьем мигают
      const isDanger = whale.isOnBeach && whale.health < 30;
      if (isDanger) {
        const blink = Math.sin(Date.now() / 250) > 0.2;
        if (blink) {
          ctx.shadowColor = 'red';
          ctx.shadowBlur = 25;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.font = `${radius * 2.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐋', cx, cy);
        ctx.shadowBlur = 0;
      } else {
        ctx.font = `${radius * 2.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐋', cx, cy);
      }

      // группа кита
      ctx.fillStyle = whale.groupColor || '#888';
      ctx.font = 'bold 7px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(whale.group, cx, cy - radius - 4);

      // имя кита 
      ctx.shadowColor = 'rgba(255,255,255,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(whale.name, cx, cy + radius + 4);
      ctx.shadowBlur = 0;

      // полоска здоровья для китов на мели
      if (whale.isOnBeach && whale.health > 0) {
        const barW = radius * 1.4;
        const barH = 3;
        const barX = cx - barW/2;
        const barY = cy + radius + 16;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(barX, barY, barW, barH);
        let color = '#4CAF50';
        if (whale.health < 20) color = '#f44336';
        else if (whale.health < 50) color = '#FF9800';
        ctx.fillStyle = color;
        ctx.fillRect(barX, barY, (whale.health / 100) * barW, barH);
      }
    }

    // спасатели
    for (const rescuer of snapshot.rescuers) {
      const cx = rescuer.x * CELL + CELL/2;
      const cy = rescuer.y * CELL + CELL/2;
      
      // на лодке или пешком
      if (rescuer.isOnBoat) {
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('🚣', cx, cy + 6);
      } else {
        const emoji = rescuer.gender === 'male' ? '👨' : '👩';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(emoji, cx, cy + 4);
      }

      // имя спасателя
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = '7px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(rescuer.name, cx, cy + 10);

      // счётчик спасений за выезд
      if (rescuer.rescuedCount > 0) {
        ctx.fillStyle = '#FF6D00';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${rescuer.rescuedCount}/3`, cx + 12, cy - 2);
      }

      // статус иконкой
      const statusMap = { 
        idle: '🟢', 
        going: '🟡', 
        on_boat: '⛵', 
        helping: '🔵', 
        returning: '🟠' 
      };
      ctx.font = '10px Arial';
      ctx.textBaseline = 'top';
      ctx.fillText(statusMap[rescuer.state] || '🟢', cx + 18, cy - 4);
    }

    //  СТАТИСТИКА НА КАНВАСЕ 
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.97)';
    ctx.fillRect(W - 150, 3, 145, 45);
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`🐋 ${snapshot.stats.saved}/${snapshot.stats.total}`, W - 10, 5);
    ctx.fillText(`🐣 Рождений: ${snapshot.birthCount || 0}`, W - 10, 20);
    ctx.fillText(`🏠 На базе: ${snapshot.baseRescuers?.length || 0}`, W - 10, 35);

    // КООРДИНАТНАЯ СЕТКА 
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = 0; x < GRID; x++) {
      if (x % 2 === 0) {
        ctx.fillText(x, x * CELL + CELL/2, 2);
      }
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = 0; y < GRID; y++) {
      if (y % 2 === 0) {
        ctx.fillText(y, 8, y * CELL + CELL/2);
      }
    }

  }, [snapshot]);

 
  const handleClick = (e) => {
    if (!snapshot || !onWhaleClick) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // проверяем китов
    for (const whale of snapshot.whales) {
      const cx = whale.x * CELL + CELL/2;
      const cy = whale.y * CELL + CELL/2;
      const radius = whale.size * 0.3 + 5;
      const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
      if (dist < radius) {
        onWhaleClick(whale.id);
        return;
      }
    }

    // проверяем спасателей
    for (const rescuer of snapshot.rescuers) {
      const cx = rescuer.x * CELL + CELL/2;
      const cy = rescuer.y * CELL + CELL/2;
      const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
      if (dist < 15) {
        onWhaleClick(rescuer.id);
        return;
      }
    }

    // проверяем базу
    const bx = 9 * CELL;
    const by = 18 * CELL;
    const size = CELL * 1.5;
    if (mx >= bx && mx <= bx + size && my >= by && my <= by + size) {
      if (onBaseClick) onBaseClick();
      return;
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        display: 'block',
        borderRadius: '12px',
        width: `${GRID * CELL}px`,
        height: `${GRID * CELL}px`,
        border: '2px solid #e0e0e0',
        cursor: 'pointer',
        background: '#6BB3E8',
        imageRendering: 'pixelated',
      }}
    />
  );
}