import React, { useState } from 'react';
import { Language } from '../../types';

const GeometricSeq: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a1, setA1] = useState(1);
  const [r, setR]   = useState(2);
  const N = 7;
  const terms = Array.from({ length: N }, (_, i) => +(a1 * Math.pow(r, i)).toFixed(2));

  const W = 280, H = 160, PAD = 20;
  const absTerms = terms.map(Math.abs);
  const maxVal = Math.max(...absTerms, 1);
  const barW = (W - PAD * 2) / N - 4;

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      {[['a₁', a1, setA1, 1, 5, 0.5], ['r', r, setR, -3, 3, 0.5]].map(([lbl, val, setter, mn, mx, step]: any) => (
        <div key={lbl as string} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 20, color: '#aaa', fontSize: 13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e => setter(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#5b8dd9' }} />
          <span style={{ width: 32, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize: 12, color: '#bbb', margin: '6px 0 10px', lineHeight: 1.8 }}>
        <div>aₙ = {a1} × {r}^(n−1)</div>
        <div style={{ fontSize: 11 }}>
          {r > 1 ? '指数增长 🚀' : r === 1 ? '常数' : r > 0 ? '指数衰减' : r < 0 ? '正负交替' : '全零'}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 300, background: '#0f1422', borderRadius: 8 }}>
        <line x1={PAD} y1={H/2} x2={W-PAD} y2={H/2} stroke="#ffffff20" strokeWidth="1" />
        {terms.map((val, i) => {
          const bh = Math.abs(val) / (maxVal * 1.15) * (H/2 - PAD);
          const x = PAD + i * ((W-PAD*2)/N) + 2;
          const isPos = val >= 0;
          const y = isPos ? H/2 - bh : H/2;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bh}
                fill={isPos ? 'rgba(80,200,130,0.7)' : 'rgba(200,130,80,0.7)'}
                stroke={isPos ? '#10b981' : '#f59e0b'} strokeWidth="0.5" rx="2" />
              <text x={x+barW/2} y={isPos ? y-3 : y+bh+10}
                textAnchor="middle" fontSize="9" fill="#aab" fontFamily="sans-serif">
                {Math.abs(val) > 999 ? val.toFixed(0) : val}
              </text>
              <text x={x+barW/2} y={H-3} textAnchor="middle" fontSize="8" fill="#666" fontFamily="sans-serif">n={i+1}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
export default GeometricSeq;
