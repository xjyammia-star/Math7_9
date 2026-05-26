import React, { useState } from 'react';
import { Language } from '../../types';

const ArithmeticSeq: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a1, setA1] = useState(2);
  const [d, setD]   = useState(3);
  const N = 8;
  const terms = Array.from({ length: N }, (_, i) => +(a1 + i * d).toFixed(1));
  const nth = (n: number) => +(a1 + (n - 1) * d).toFixed(1);

  const W = 280, H = 150, PAD = 20;
  const maxVal = Math.max(...terms.map(Math.abs), 1);
  const barW = (W - PAD * 2) / N - 4;

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      {[['a₁', a1, setA1, -5, 10, 0.5], ['d', d, setD, -5, 8, 0.5]].map(([lbl, val, setter, mn, mx, step]: any) => (
        <div key={lbl as string} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 20, color: '#aaa', fontSize: 13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e => setter(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#5b8dd9' }} />
          <span style={{ width: 32, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize: 12, color: '#bbb', margin: '6px 0 10px', lineHeight: 1.8 }}>
        <div>aₙ = {a1} + (n−1)×{d}</div>
        <div>前8项: {terms.join(', ')}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 300, background: '#0f1422', borderRadius: 8 }}>
        <line x1={PAD} y1={H/2} x2={W-PAD} y2={H/2} stroke="#ffffff20" strokeWidth="1" />
        {terms.map((val, i) => {
          const bh = Math.abs(val) / (maxVal * 1.1) * (H/2 - PAD);
          const x = PAD + i * ((W-PAD*2)/N) + 2;
          const isPos = val >= 0;
          const y = isPos ? H/2 - bh : H/2;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bh}
                fill={isPos ? 'rgba(80,140,220,0.7)' : 'rgba(220,100,100,0.7)'}
                stroke={isPos ? '#5b8dd9' : '#e44'} strokeWidth="0.5" rx="2" />
              <text x={x+barW/2} y={isPos ? y-3 : y+bh+10}
                textAnchor="middle" fontSize="9" fill="#aab" fontFamily="sans-serif">{val}</text>
              <text x={x+barW/2} y={H-4}
                textAnchor="middle" fontSize="8" fill="#666" fontFamily="sans-serif">n={i+1}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
export default ArithmeticSeq;
