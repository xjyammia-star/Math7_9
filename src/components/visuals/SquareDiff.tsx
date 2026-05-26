import React, { useState } from 'react';
import { Language } from '../../types';

const SquareDiff: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a, setA] = useState(9);
  const [b, setB] = useState(6);
  const safeB = Math.min(b, a - 0.5);

  const ab2    = +((a - safeB) ** 2).toFixed(2);
  const a2     = +(a * a).toFixed(2);
  const b2     = +(safeB * safeB).toFixed(2);
  const twoab  = +(2 * a * safeB).toFixed(2);

  const W = 280, H = 260;
  // Dynamic: scale so big square fills ~72% of canvas
  const sc = (Math.min(W, H) * 0.72) / a;
  const A  = a * sc, B = safeB * sc, AB = (a - safeB) * sc;
  const ox = (W - A) / 2, oy = (H - A) / 2;

  const steps = [
    { key: 'a2',  label: 'a²' },
    { key: 'tab', label: 'Top −ab' },
    { key: 'lab', label: 'Left −ab' },
    { key: 'b2',  label: '+b²' },
    { key: 'fin', label: lang === 'zh' ? '最终' : 'Final' },
  ];
  const [step, setStep] = useState('fin');

  function rect(x: number, y: number, w: number, h: number, fill: string, label?: string) {
    if (w < 1 || h < 1) return null;
    return (
      <g key={`${x}-${y}-${fill}`}>
        <rect x={x} y={y} width={w} height={h} fill={fill} stroke="#555" strokeWidth="1" />
        {label && w > 22 && h > 16 && (
          <text x={x+w/2} y={y+h/2} textAnchor="middle" dominantBaseline="middle"
            fontSize="12" fill="#fff" fontFamily="sans-serif" fontWeight="bold">{label}</text>
        )}
      </g>
    );
  }

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      {[['a', a, setA, 1, 12, a - 0.5], ['b', safeB, (v: number) => setB(v), 0.5, a - 0.5, null]].map(([lbl, val, setter, mn, mx]: any) => (
        <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 12, color: '#aaa', fontSize: 13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={0.5} value={val}
            onChange={e => setter(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#5b8dd9' }} />
          <span style={{ width: 36, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize: 12, color: '#bbb', margin: '8px 0', lineHeight: 1.8 }}>
        <div>(a−b)² = a² − 2ab + b²</div>
        <div>{a}² = {a2} − {twoab} + {b2} = <strong style={{ color: '#7db3ff' }}>{ab2}</strong></div>
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
        {step==='a2' && rect(ox, oy, A, A, 'rgba(200,100,140,0.8)', 'a²')}
        {step==='tab' && <>{rect(ox, oy, A, A, 'rgba(200,100,140,0.25)')}{rect(ox+AB, oy, B, AB, 'rgba(160,100,200,0.8)', '−ab')}</>}
        {step==='lab' && <>{rect(ox, oy, A, A, 'rgba(200,100,140,0.25)')}{rect(ox, oy+AB, AB, B, 'rgba(160,100,200,0.8)', '−ab')}</>}
        {step==='b2'  && <>{rect(ox, oy, A, A, 'rgba(200,100,140,0.25)')}{rect(ox+AB, oy+AB, B, B, 'rgba(80,180,100,0.8)', '+b²')}</>}
        {step==='fin' && <>
          {rect(ox, oy, A, A, 'rgba(220,160,180,0.5)')}
          {B>4 && rect(ox+AB, oy, B, AB, 'rgba(160,100,200,0.55)', '−ab')}
          {B>4 && rect(ox, oy+AB, AB, B, 'rgba(160,100,200,0.55)', '−ab')}
          {B>4 && rect(ox+AB, oy+AB, B, B, 'rgba(80,180,100,0.55)', '+b²')}
          {AB>4 && rect(ox, oy, AB, AB, 'rgba(80,140,220,0.9)', '(a−b)²')}
        </>}
        {/* axis labels outside the square */}
        <text x={ox+A/2} y={oy-10} textAnchor="middle" fontSize="12" fill="#aab" fontFamily="sans-serif">a</text>
        <text x={ox-14} y={oy+A/2} textAnchor="middle" fontSize="12" fill="#aab" fontFamily="sans-serif">a</text>
      </svg>
    </div>
  );
};
export default SquareDiff;
