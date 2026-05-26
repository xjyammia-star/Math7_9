import React, { useState } from 'react';
import { Language } from '../../types';

const TriangleArea: React.FC<{ lang: Language }> = ({ lang }) => {
  const [base, setBase] = useState(8);
  const [height, setHeight] = useState(5);

  const area = +(0.5 * base * height).toFixed(2);
  const W = 260, H = 180, PAD = 24;
  const sc = (W - PAD*2) / 12;
  const ox = PAD, oy = H - PAD;
  const B = base * sc, HH = height * sc;

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      {[['底', base, setBase, 1, 10], ['高', height, setHeight, 1, 8]].map(([lbl, val, setter, mn, mx]: any) => (
        <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 20, color: '#aaa', fontSize: 13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={0.5} value={val}
            onChange={e => setter(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#5b8dd9' }} />
          <span style={{ width: 32, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize: 12, color: '#bbb', margin: '6px 0 10px', lineHeight: 1.8 }}>
        <div>S = ½ × 底 × 高 = ½ × {base} × {height} = <strong style={{ color: '#7db3ff' }}>{area}</strong></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 280, background: '#0f1422', borderRadius: 8 }}>
        {/* Parallelogram (dashed) */}
        <polygon points={`${ox},${oy} ${ox+B},${oy} ${ox+B+B/3},${oy-HH} ${ox+B/3},${oy-HH}`}
          fill="rgba(80,140,220,0.15)" stroke="#26c" strokeWidth="1" strokeDasharray="5 3" />
        {/* Triangle */}
        <polygon points={`${ox},${oy} ${ox+B},${oy} ${ox+B/3},${oy-HH}`}
          fill="rgba(80,140,220,0.6)" stroke="#5b8dd9" strokeWidth="1.5" />
        {/* Height line */}
        <line x1={ox+B/3} y1={oy} x2={ox+B/3} y2={oy-HH} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x={ox+B/3+5} y={oy-HH/2} fontSize="11" fill="#f59e0b" fontFamily="sans-serif">h={height}</text>
        <text x={ox+B/2} y={oy+14} textAnchor="middle" fontSize="11" fill="#7db3ff" fontFamily="sans-serif">b={base}</text>
        <text x={ox+B+B/3+10} y={oy-HH/2} fontSize="10" fill="#aab" fontFamily="sans-serif">= 平行四边形的½</text>
        {/* Right angle mark */}
        <polyline points={`${ox+B/3+6},${oy} ${ox+B/3+6},${oy-6} ${ox+B/3},${oy-6}`}
          fill="none" stroke="#f59e0b" strokeWidth="1" />
      </svg>
    </div>
  );
};
export default TriangleArea;
