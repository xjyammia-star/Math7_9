import React, { useState } from 'react';
import { Language } from '../../types';

const CircleArea: React.FC<{ lang: Language }> = ({ lang }) => {
  const [r, setR] = useState(4);
  const area = +(Math.PI * r * r).toFixed(2);
  const W = 240, H = 200;
  const cx = W/2, cy = H/2;
  const sc = 18;
  const R = r * sc;

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 12, color: '#aaa', fontSize: 13 }}>r</span>
        <input type="range" min={1} max={5} step={0.5} value={r}
          onChange={e => setR(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: '#5b8dd9' }} />
        <span style={{ width: 32, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{r}</span>
      </div>
      <div style={{ fontSize: 12, color: '#bbb', margin: '6px 0 10px', lineHeight: 1.8 }}>
        <div>S = π × r² = π × {r}² = <strong style={{ color: '#7db3ff' }}>{area}</strong></div>
        <div style={{ fontSize: 11 }}>r×2 → 面积×<strong style={{ color: '#f59e0b' }}>4</strong>（不是 ×2！）</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 260, background: '#0f1422', borderRadius: 8 }}>
        {/* Reference circle r=1,2,3 */}
        {[1,2,3].map(ref => (
          <circle key={ref} cx={cx} cy={cy} r={ref*sc}
            fill="none" stroke="#ffffff08" strokeWidth="1" />
        ))}
        {/* Main circle */}
        <circle cx={cx} cy={cy} r={R} fill="rgba(80,140,220,0.35)" stroke="#5b8dd9" strokeWidth="2" />
        {/* Radius line */}
        <line x1={cx} y1={cy} x2={cx+R} y2={cy} stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="3" fill="#f59e0b" />
        <text x={cx+R/2} y={cy-6} textAnchor="middle" fontSize="11" fill="#f59e0b" fontFamily="sans-serif">r={r}</text>
        <text x={cx} y={cy+R/2+8} textAnchor="middle" fontSize="12" fill="#7db3ff" fontFamily="sans-serif">S={area}</text>
      </svg>
    </div>
  );
};
export default CircleArea;
