import React, { useState } from 'react';
import { Language } from '../../types';

const TrigBasic: React.FC<{ lang: Language }> = ({ lang }) => {
  const [deg, setDeg] = useState(30);
  const rad = deg * Math.PI / 180;
  const sinV = +Math.sin(rad).toFixed(4);
  const cosV = +Math.cos(rad).toFixed(4);
  const tanV = Math.abs(Math.cos(rad)) > 0.001 ? +(Math.tan(rad)).toFixed(4) : '∞';

  const W = 240, H = 200, PAD = 30;
  const ox = PAD + 10, oy = H - PAD;
  const HYP = 140;
  const ax = ox + HYP * Math.cos(rad);
  const ay = oy - HYP * Math.sin(rad);

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 20, color: '#aaa', fontSize: 13 }}>θ°</span>
        <input type="range" min={5} max={85} step={1} value={deg}
          onChange={e => setDeg(parseInt(e.target.value))}
          style={{ flex: 1, accentColor: '#5b8dd9' }} />
        <span style={{ width: 36, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{deg}°</span>
      </div>
      <div style={{ fontSize: 12, color: '#bbb', margin: '6px 0 10px', lineHeight: 1.9 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
          <div>sin{deg}° = <strong style={{ color: '#ef4444' }}>{sinV}</strong></div>
          <div>cos{deg}° = <strong style={{ color: '#3b82f6' }}>{cosV}</strong></div>
          <div>tan{deg}° = <strong style={{ color: '#f59e0b' }}>{tanV}</strong></div>
        </div>
        <div style={{ fontSize: 11, marginTop: 2 }}>SOH · CAH · TOA</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 260, background: '#0f1422', borderRadius: 8 }}>
        {/* Hypotenuse */}
        <line x1={ox} y1={oy} x2={ax} y2={ay} stroke="#aab" strokeWidth="2" />
        {/* Opposite (red) */}
        <line x1={ax} y1={oy} x2={ax} y2={ay} stroke="#ef4444" strokeWidth="2.5" />
        {/* Adjacent (blue) */}
        <line x1={ox} y1={oy} x2={ax} y2={oy} stroke="#3b82f6" strokeWidth="2.5" />
        {/* Right angle mark */}
        <polyline points={`${ax-8},${oy} ${ax-8},${oy-8} ${ax},${oy-8}`}
          fill="none" stroke="#aab" strokeWidth="1" />
        {/* Angle arc */}
        <path d={`M${ox+26},${oy} A26,26 0 0,0 ${ox+26*Math.cos(rad)},${oy-26*Math.sin(rad)}`}
          fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <text x={ox+30} y={oy-10} fontSize="11" fill="#f59e0b" fontFamily="sans-serif">{deg}°</text>
        {/* Labels */}
        <text x={(ox+ax)/2} y={oy+14} textAnchor="middle" fontSize="10" fill="#3b82f6" fontFamily="sans-serif">adj</text>
        <text x={ax+6} y={(oy+ay)/2} fontSize="10" fill="#ef4444" fontFamily="sans-serif">opp</text>
        <text x={(ox+ax)/2-12} y={(oy+ay)/2-6} fontSize="10" fill="#aab" fontFamily="sans-serif">hyp</text>
      </svg>
    </div>
  );
};
export default TrigBasic;
