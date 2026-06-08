import React, { useState } from 'react';
import { Language } from '../../types';

const Pythagorean: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const c = Math.sqrt(a * a + b * b);
  const [step, setStep] = useState('fin');

  const W = 300, H = 280;
  // Dynamic scale: fit the whole diagram (triangle + 3 squares) inside canvas
  // Max extent needed: a+b in both x and y directions, plus squares sticking out
  const maxExtent = Math.max(a + b, b + b, a + a) * 1.15;
  const sc = Math.min((W * 0.62) / maxExtent, (H * 0.62) / maxExtent);

  const A = a * sc, B = b * sc;
  // Triangle: right angle at center, leg a goes right, leg b goes up
  const ox = W / 2 - A / 2 + B * 0.1;
  const oy = H / 2 + A / 2 + B * 0.1;

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
    const w = Math.sqrt((pts[1][0]-pts[0][0])**2+(pts[1][1]-pts[0][1])**2);
    return (
      <g key={fill}>
        <path d={d} fill={fill} stroke="#555" strokeWidth="1" />
        {label && w > 24 && (
          <text x={cx2} y={cy2} textAnchor="middle" dominantBaseline="middle"
            fontSize="12" fill="#fff" fontFamily="sans-serif" fontWeight="bold">{label}</text>
        )}
      </g>
    );
  }

  const showTri = ['tri','a2','b2','c2','fin'].includes(step);
  const showA   = step==='a2' || step==='fin';
  const showB   = step==='b2' || step==='fin';
  const showC   = step==='c2' || step==='fin';

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      {[['a', a, setA, 1, 9], ['b', b, setB, 1, 9]].map(([lbl, val, setter, mn, mx]: any) => (
        <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 12, color: '#aaa', fontSize: 13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={0.5} value={val}
            onChange={e => setter(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#5b8dd9' }} />
          <span style={{ width: 36, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{(+val).toFixed(1)}</span>
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
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {showA && sq(sqA, 'rgba(220,100,100,0.65)', 'a²')}
        {showB && sq(sqB, 'rgba(80,160,220,0.65)', 'b²')}
        {showC && sq(sqC, 'rgba(80,200,130,0.65)', 'c²')}
        {showTri && (
          <polygon points={`${ox},${oy} ${Ax},${Ay} ${Bx},${By}`}
            fill="rgba(240,200,80,0.55)" stroke="#cc8" strokeWidth="1.5" />
        )}
        {/* right angle mark */}
        {showTri && <polyline points={`${ox+8},${oy} ${ox+8},${oy-8} ${ox},${oy-8}`} fill="none" stroke="#ffd" strokeWidth="1" />}
        <text x={(ox+Ax)/2} y={oy+16} textAnchor="middle" fontSize="12" fill="#ffd" fontFamily="sans-serif">a</text>
        <text x={ox-18} y={(oy+By)/2} textAnchor="middle" fontSize="12" fill="#8df" fontFamily="sans-serif">b</text>
        <text x={(Ax+Bx)/2 + nx/Math.hypot(nx,ny)*14} y={(Ay+By)/2 + ny/Math.hypot(nx,ny)*14}
          textAnchor="middle" fontSize="12" fill="#8fb" fontFamily="sans-serif">c</text>
      </svg>
    </div>
  );
};
export default Pythagorean;
