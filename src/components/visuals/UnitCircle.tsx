import React, { useState } from 'react';
import { Language } from '../../types';

const UnitCircle: React.FC<{ lang: Language }> = ({ lang }) => {
  const [deg, setDeg] = useState(45);
  const rad = deg * Math.PI / 180;
  const cosV = +Math.cos(rad).toFixed(4);
  const sinV = +Math.sin(rad).toFixed(4);

  const W = 220, H = 220;
  const cx = W/2, cy = H/2;
  const R = 85;
  const px = cx + R * Math.cos(rad);
  const py = cy - R * Math.sin(rad);

  const specials = [0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330];

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 20, color: '#aaa', fontSize: 13 }}>θ°</span>
        <input type="range" min={0} max={360} step={1} value={deg}
          onChange={e => setDeg(parseInt(e.target.value))}
          style={{ flex: 1, accentColor: '#5b8dd9' }} />
        <span style={{ width: 36, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{deg}°</span>
      </div>
      <div style={{ fontSize: 12, color: '#bbb', margin: '6px 0 10px', lineHeight: 1.9 }}>
        <div>点坐标: (<strong style={{ color: '#3b82f6' }}>{cosV}</strong>, <strong style={{ color: '#ef4444' }}>{sinV}</strong>)</div>
        <div>sin²θ + cos²θ = {+(sinV**2 + cosV**2).toFixed(3)} ✓</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 240, background: '#0f1422', borderRadius: 8 }}>
        {/* Axes */}
        <line x1={10} y1={cy} x2={W-10} y2={cy} stroke="#ffffff25" strokeWidth="1" />
        <line x1={cx} y1={10} x2={cx} y2={H-10} stroke="#ffffff25" strokeWidth="1" />
        {/* Circle */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#ffffff20" strokeWidth="1.5" />
        {/* Special angle dots */}
        {specials.map(d => {
          const r2 = d * Math.PI / 180;
          return <circle key={d} cx={cx+R*Math.cos(r2)} cy={cy-R*Math.sin(r2)} r="2" fill="#ffffff20" />;
        })}
        {/* cos projection (blue) */}
        <line x1={cx} y1={py} x2={px} y2={py} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
        <line x1={cx} y1={cy} x2={cx+R*cosV} y2={cy} stroke="#3b82f6" strokeWidth="2.5" />
        {/* sin projection (red) */}
        <line x1={px} y1={cy} x2={px} y2={py} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
        <line x1={cx} y1={cy} x2={cx} y2={cy-R*sinV} stroke="#ef4444" strokeWidth="2.5" />
        {/* Radius */}
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#aab" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="4" fill="#f59e0b" />
        {/* Point */}
        <circle cx={px} cy={py} r="5" fill="#f59e0b" />
        {/* Labels */}
        <text x={cx+R*cosV/2} y={cy+12} textAnchor="middle" fontSize="10" fill="#3b82f6" fontFamily="sans-serif">cosθ</text>
        <text x={cx-18} y={cy-R*sinV/2} fontSize="10" fill="#ef4444" fontFamily="sans-serif">sinθ</text>
        <text x={px+6} y={py-4} fontSize="9" fill="#f59e0b" fontFamily="sans-serif">({cosV},{sinV})</text>
      </svg>
    </div>
  );
};
export default UnitCircle;
