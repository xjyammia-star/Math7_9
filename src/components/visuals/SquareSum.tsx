import React, { useState } from 'react';
import { Language } from '../../types';

const SquareSum: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a, setA] = useState(6);
  const [b, setB] = useState(4);

  const total  = a + b;
  const a2     = +(a * a).toFixed(2);
  const b2     = +(b * b).toFixed(2);
  const ab     = +(a * b).toFixed(2);
  const result = +(total * total).toFixed(2);

  const W = 280, H = 260;
  const sc = (Math.min(W, H) * 0.75) / total;
  const A  = a * sc, B = b * sc;
  const ox = (W - A - B) / 2, oy = (H - A - B) / 2;

  const [step, setStep] = useState('fin');
  const steps = [
    { key: 'a2',  label: 'a²' },
    { key: 'ab1', label: lang === 'zh' ? 'ab右上' : 'ab top-right' },
    { key: 'ab2', label: lang === 'zh' ? 'ab左下' : 'ab bottom-left' },
    { key: 'b2',  label: 'b²' },
    { key: 'fin', label: lang === 'zh' ? '全部' : 'All' },
  ];

  function rect(x: number, y: number, w: number, h: number, fill: string, label?: string) {
    if (w < 1 || h < 1) return null;
    return (
      <g key={`${x}-${y}-${fill}`}>
        <rect x={x} y={y} width={w} height={h} fill={fill} stroke="#444" strokeWidth="1" />
        {label && w > 22 && h > 16 && (
          <text x={x+w/2} y={y+h/2} textAnchor="middle" dominantBaseline="middle"
            fontSize="12" fill="#fff" fontFamily="sans-serif" fontWeight="bold">{label}</text>
        )}
      </g>
    );
  }

  const showA2  = step==='a2'  || step==='fin';
  const showAB1 = step==='ab1' || step==='fin';
  const showAB2 = step==='ab2' || step==='fin';
  const showB2  = step==='b2'  || step==='fin';

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      {[['a', a, setA, 1, 10], ['b', b, setB, 1, 10]].map(([lbl, val, setter, mn, mx]: any) => (
        <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 12, color: '#aaa', fontSize: 13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={0.5} value={val}
            onChange={e => setter(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#5b8dd9' }} />
          <span style={{ width: 36, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize: 12, color: '#bbb', margin: '8px 0', lineHeight: 1.8 }}>
        <div>(a+b)² = a² + 2ab + b²</div>
        <div>= {a2} + 2×{ab} + {b2} = <strong style={{ color: '#7db3ff' }}>{result}</strong></div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {steps.map(s => (
          <button key={s.key} onClick={() => setStep(s.key)}
            style={{ padding: '3px 10px', borderRadius: 20, border: '1px solid', fontSize: 11, cursor: 'pointer',
              borderColor: step===s.key ? '#5b8dd9' : '#445',
              background: step===s.key ? '#2a4a7f' : 'transparent',
              color: step===s.key ? '#fff' : '#99a' }}>
            {s.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        <rect x={ox} y={oy} width={A+B} height={A+B} fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4 2" />
        {showA2  && rect(ox, oy, A, A, 'rgba(200,100,140,0.75)', 'a²')}
        {showAB1 && rect(ox+A, oy, B, A, 'rgba(160,130,220,0.75)', 'ab')}
        {showAB2 && rect(ox, oy+A, A, B, 'rgba(160,130,220,0.75)', 'ab')}
        {showB2  && rect(ox+A, oy+A, B, B, 'rgba(80,180,100,0.75)', 'b²')}
        <text x={ox+A/2} y={oy-10} textAnchor="middle" fontSize="12" fill="#aab" fontFamily="sans-serif">a</text>
        <text x={ox+A+B/2} y={oy-10} textAnchor="middle" fontSize="12" fill="#aab" fontFamily="sans-serif">b</text>
        <text x={ox-14} y={oy+A/2} textAnchor="middle" fontSize="12" fill="#aab" fontFamily="sans-serif">a</text>
        <text x={ox-14} y={oy+A+B/2} textAnchor="middle" fontSize="12" fill="#aab" fontFamily="sans-serif">b</text>
      </svg>
    </div>
  );
};
export default SquareSum;
