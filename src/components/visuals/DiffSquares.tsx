import React, { useState } from 'react';
import { Language } from '../../types';

const DiffSquares: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a, setA] = useState(8);
  const [b, setB] = useState(4);
  const safeB = Math.min(b, a - 0.5);

  const result = +((a + safeB) * (a - safeB)).toFixed(2);
  const a2 = +(a * a).toFixed(2);
  const b2 = +(safeB * safeB).toFixed(2);

  const MAX = 12, PAD = 28, SIZE = 180;
  const sc = SIZE / MAX;
  const A = a * sc, B = safeB * sc, AB = (a - safeB) * sc;
  const ox = PAD, oy = PAD;

  const [step, setStep] = useState('rearrange');
  const steps = [
    { key: 'both', label: lang === 'zh' ? 'a² 和 b²' : 'a² and b²' },
    { key: 'diff', label: lang === 'zh' ? 'L形区域' : 'L-shape' },
    { key: 'rearrange', label: lang === 'zh' ? '重新拼合' : 'Rearranged' },
  ];

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      {[['a', a, setA, 1.5, 12], ['b', safeB, (v: number) => setB(v), 0.5, a - 0.5]].map(([lbl, val, setter, mn, mx]: any) => (
        <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 12, color: '#aaa', fontSize: 13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={0.5} value={val}
            onChange={e => setter(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#5b8dd9' }} />
          <span style={{ width: 32, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize: 12, color: '#bbb', margin: '8px 0', lineHeight: 1.8 }}>
        <div>a² − b² = (a+b)(a−b)</div>
        <div>{a2} − {b2} = ({a}+{safeB})×({a}−{safeB}) = <strong style={{ color: '#7db3ff' }}>{result}</strong></div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {steps.map(s => (
          <button key={s.key} onClick={() => setStep(s.key)}
            style={{ padding: '3px 10px', borderRadius: 20, border: '1px solid', fontSize: 11, cursor: 'pointer',
              borderColor: step === s.key ? '#5b8dd9' : '#445',
              background: step === s.key ? '#2a4a7f' : 'transparent',
              color: step === s.key ? '#fff' : '#99a' }}>
            {s.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${SIZE + PAD * 2} ${SIZE + PAD * 2}`} style={{ width: '100%', maxWidth: 260 }}>
        {step === 'both' && <>
          <rect x={ox} y={oy} width={A} height={A} fill="rgba(200,100,140,0.6)" stroke="#a06" strokeWidth="1" />
          <text x={ox+A/2} y={oy+A/2} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#fff" fontFamily="sans-serif">a²</text>
          <rect x={ox+A+10} y={oy} width={B} height={B} fill="rgba(80,180,100,0.6)" stroke="#0a5" strokeWidth="1" />
          <text x={ox+A+10+B/2} y={oy+B/2} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#fff" fontFamily="sans-serif">b²</text>
        </>}
        {step === 'diff' && <>
          <rect x={ox} y={oy} width={A} height={A} fill="rgba(200,100,140,0.4)" stroke="#777" strokeWidth="1" />
          {/* L-shape = top strip + right column */}
          <rect x={ox} y={oy} width={AB} height={A} fill="rgba(80,140,220,0.7)" stroke="#26c" strokeWidth="1" />
          <rect x={ox+AB} y={oy} width={B} height={AB} fill="rgba(80,140,220,0.7)" stroke="#26c" strokeWidth="1" />
          <rect x={ox+AB} y={oy+AB} width={B} height={B} fill="rgba(200,100,140,0.4)" stroke="#777" strokeWidth="1" />
          <text x={ox+A/2-6} y={oy+A/2+16} textAnchor="middle" fontSize="10" fill="#aab" fontFamily="sans-serif">L形 = a²−b²</text>
        </>}
        {step === 'rearrange' && <>
          {/* rectangle (a+b) wide, (a-b) tall */}
          <rect x={ox} y={oy+B} width={A+B} height={AB} fill="rgba(80,140,220,0.75)" stroke="#26c" strokeWidth="1" />
          <text x={ox+(A+B)/2} y={oy+B+AB/2} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#fff" fontFamily="sans-serif">(a+b)×(a−b)</text>
          <text x={ox+(A+B)/2} y={oy+B-8} textAnchor="middle" fontSize="10" fill="#aab" fontFamily="sans-serif">a+b = {+(a+safeB).toFixed(1)}</text>
          <text x={ox-8} y={oy+B+AB/2} textAnchor="end" fontSize="10" fill="#aab" fontFamily="sans-serif">a−b={+(a-safeB).toFixed(1)}</text>
        </>}
      </svg>
    </div>
  );
};
export default DiffSquares;
