import React, { useState } from 'react';
import { Language } from '../../types';

const Pythagorean: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const c = Math.sqrt(a * a + b * b);
  const [step, setStep] = useState('fin');

  const PAD = 36, SIZE = 170, MAX = 12;
  const sc = SIZE / MAX;
  const A = a * sc, B = b * sc;
  const ox = PAD + B, oy = PAD + A;

  const Ax = ox + A, Ay = oy;
  const Bx = ox,     By = oy - B;

  const dx = Bx - Ax, dy = By - Ay;
  const len = Math.sqrt(dx*dx+dy*dy);
  const nx = -dy/len * (c*sc), ny = dx/len * (c*sc);

  const sqA  = [[ox,oy],[Ax,Ay],[Ax,Ay+A],[ox,oy+A]];
  const sqB  = [[ox,oy],[ox,By],[ox-B,By],[ox-B,oy]];
  const sqC  = [[Ax,Ay],[Bx,By],[Bx+nx,By+ny],[Ax+nx,Ay+ny]];

  const steps = [
    { key: 'tri', label: lang === 'zh' ? '三角形' : 'Triangle' },
    { key: 'a2',  label: 'a²' },
    { key: 'b2',  label: 'b²' },
    { key: 'c2',  label: 'c²' },
    { key: 'fin', label: lang === 'zh' ? '全部' : 'All' },
  ];

  function sq(pts: number[][], fill: string, label?: string) {
    const d = pts.map((p,i) => `${i===0?'M':'L'}${p[0]},${p[1]}`).join('') + 'Z';
    const cx2 = pts.reduce((s,p)=>s+p[0],0)/4;
    const cy2 = pts.reduce((s,p)=>s+p[1],0)/4;
    return (
      <g key={fill}>
        <path d={d} fill={fill} stroke="#555" strokeWidth="1" />
        {label && <text x={cx2} y={cy2} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#fff" fontFamily="sans-serif">{label}</text>}
      </g>
    );
  }

  const showTri = ['tri','a2','b2','c2','fin'].includes(step);
  const showA   = step==='a2' || step==='fin';
  const showB   = step==='b2' || step==='fin';
  const showC   = step==='c2' || step==='fin';

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      {[['a', a, setA, 1, 8], ['b', b, setB, 1, 8]].map(([lbl, val, setter, mn, mx]: any) => (
        <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 12, color: '#aaa', fontSize: 13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={0.5} value={val}
            onChange={e => setter(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#5b8dd9' }} />
          <span style={{ width: 32, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize: 12, color: '#bbb', margin: '6px 0 8px', lineHeight: 1.8 }}>
        <div>a² + b² = c²</div>
        <div>{a}² + {b}² = {+(a*a).toFixed(1)} + {+(b*b).toFixed(1)} = <strong style={{ color: '#7db3ff' }}>{+(c*c).toFixed(2)}</strong></div>
        <div>c = √{+(c*c).toFixed(2)} = <strong style={{ color: '#8fb' }}>{c.toFixed(3)}</strong></div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
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
      <svg viewBox={`0 0 ${SIZE + PAD*2} ${SIZE + PAD*2}`} style={{ width: '100%', maxWidth: 260 }}>
        {showA && sq(sqA, 'rgba(220,100,100,0.65)', 'a²')}
        {showB && sq(sqB, 'rgba(80,160,220,0.65)', 'b²')}
        {showC && sq(sqC, 'rgba(80,200,130,0.65)', 'c²')}
        {showTri && (
          <polygon points={`${ox},${oy} ${Ax},${Ay} ${Bx},${By}`}
            fill="rgba(240,200,80,0.5)" stroke="#cc8" strokeWidth="1.5" />
        )}
        <text x={(ox+Ax)/2} y={oy+14} textAnchor="middle" fontSize="11" fill="#ffd" fontFamily="sans-serif">a</text>
        <text x={ox-16} y={(oy+By)/2} textAnchor="middle" fontSize="11" fill="#8df" fontFamily="sans-serif">b</text>
        <text x={(Ax+Bx)/2+12} y={(Ay+By)/2-4} textAnchor="middle" fontSize="11" fill="#8fb" fontFamily="sans-serif">c</text>
      </svg>
    </div>
  );
};
export default Pythagorean;
