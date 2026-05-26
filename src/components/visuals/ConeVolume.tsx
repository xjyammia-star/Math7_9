import React, { useState } from 'react';
import { Language } from '../../types';

const ConeVolume: React.FC<{ lang: Language }> = ({ lang }) => {
  const [r, setR] = useState(3);
  const [h, setH] = useState(5);
  const volCone = +(Math.PI * r * r * h / 3).toFixed(2);
  const volCyl  = +(Math.PI * r * r * h).toFixed(2);

  const W = 240, H = 200;
  const cx = W / 2;
  const sc = 14;
  const R = r * sc;
  const H2 = h * sc;
  const oy = H / 2 + H2 / 2 - 10;
  const ry = R * 0.35;

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      {[['r', r, setR, 1, 5, 0.5], ['h', h, setH, 1, 8, 0.5]].map(([lbl, val, setter, mn, mx, step]: any) => (
        <div key={lbl as string} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 12, color: '#aaa', fontSize: 13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e => setter(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#5b8dd9' }} />
          <span style={{ width: 32, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize: 12, color: '#bbb', margin: '6px 0 10px', lineHeight: 1.8 }}>
        <div>V = ⅓πr²h = <strong style={{ color: '#7db3ff' }}>{volCone}</strong></div>
        <div style={{ fontSize: 11 }}>圆柱体积 = {volCyl}，圆锥 = <strong style={{ color: '#f59e0b' }}>圆柱的 1/3</strong></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 260, background: '#0f1422', borderRadius: 8 }}>
        {/* Cylinder ghost */}
        <rect x={cx-R} y={oy-H2} width={R*2} height={H2} fill="none" stroke="#ffffff15" strokeWidth="1" strokeDasharray="4 3" />
        <ellipse cx={cx} cy={oy-H2} rx={R} ry={ry} fill="none" stroke="#ffffff15" strokeWidth="1" strokeDasharray="4 3" />
        {/* Cone */}
        <polygon points={`${cx-R},${oy} ${cx+R},${oy} ${cx},${oy-H2}`}
          fill="rgba(80,140,220,0.45)" stroke="#5b8dd9" strokeWidth="1.5" />
        <ellipse cx={cx} cy={oy} rx={R} ry={ry} fill="rgba(80,140,220,0.65)" stroke="#5b8dd9" strokeWidth="1.5" />
        {/* 1/3 markers */}
        {[1/3, 2/3].map((frac, i) => (
          <line key={i} x1={cx-R*0.6} y1={oy-H2*frac} x2={cx+R*0.6} y2={oy-H2*frac}
            stroke="#f59e0b30" strokeWidth="1" strokeDasharray="3 2" />
        ))}
        <text x={cx+R+6} y={oy-H2*0.5} fontSize="10" fill="#f59e0b" fontFamily="sans-serif">h={h}</text>
        <text x={cx} y={oy+14} textAnchor="middle" fontSize="10" fill="#f59e0b" fontFamily="sans-serif">r={r}</text>
        <text x={14} y={16} fontSize="9" fill="#aab" fontFamily="sans-serif">圆柱={volCyl}</text>
        <text x={14} y={28} fontSize="9" fill="#7db3ff" fontFamily="sans-serif">圆锥={volCone}</text>
      </svg>
    </div>
  );
};
export default ConeVolume;
