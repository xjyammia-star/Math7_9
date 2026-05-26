import React, { useState } from 'react';
import { Language } from '../../types';

const CompletingSquare: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-4);
  const [c, setC] = useState(1);
  const zh = lang === 'zh';
  const h = -b / (2 * a);
  const k = c - b * b / (4 * a);

  const W = 280, H = 220, PAD = 32;
  const cx = W/2, cy = H/2+10;
  const SCALE = Math.min((W/2-PAD)/5, (H/2-PAD)/5);

  const points1: string[] = [], points2: string[] = [];
  for (let px=-6; px<=6; px+=0.08) {
    const py1 = a*px*px+b*px+c;
    const py2 = a*(px-h)*(px-h)+k;
    const sx = cx+px*SCALE;
    const sy1 = cy-py1*SCALE, sy2 = cy-py2*SCALE;
    if (sy1>PAD && sy1<H-PAD+10) points1.push(`${sx},${sy1}`);
    if (sy2>PAD && sy2<H-PAD+10) points2.push(`${sx},${sy2}`);
  }

  const bStr = b >= 0 ? `+${b}` : `${b}`;
  const cStr = c >= 0 ? `+${c}` : `${c}`;
  const kStr = k >= 0 ? `+${k.toFixed(2)}` : `${k.toFixed(2)}`;

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([['a', a, setA, -2, 2, 0.5], ['b', b, setB, -6, 6, 0.5], ['c', c, setC, -5, 5, 0.5]] as any[]).map(([lbl,val,setter,mn,mx,step]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
          <span style={{ width:12, color:'#aaa', fontSize:13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e=>setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:36, textAlign:'right', fontWeight:600, fontSize:13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize:11, color:'#bbb', margin:'6px 0 8px', lineHeight:1.9 }}>
        <div>{zh?'一般式':'Standard'}: y = <strong style={{ color:'#5b8dd9' }}>{a}x²{bStr}x{cStr}</strong></div>
        <div>{zh?'顶点式':'Vertex form'}: y = <strong style={{ color:'#f59e0b' }}>{a}(x−{h.toFixed(2)})²{kStr}</strong></div>
        <div>{zh?'顶点':'Vertex'}: (<strong style={{ color:'#f59e0b' }}>{h.toFixed(2)}, {k.toFixed(2)}</strong>)</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        <defs><clipPath id="csClip"><rect x={PAD} y={PAD} width={W-PAD*2} height={H-PAD*2} /></clipPath></defs>
        {[-4,-3,-2,-1,0,1,2,3,4].map(x=>(
          <line key={x} x1={cx+x*SCALE} y1={PAD} x2={cx+x*SCALE} y2={H-PAD} stroke="#ffffff08" strokeWidth="1" />
        ))}
        <line x1={PAD} y1={cy} x2={W-PAD} y2={cy} stroke="#ffffff25" strokeWidth="1.5" />
        <line x1={cx} y1={PAD} x2={cx} y2={H-PAD} stroke="#ffffff25" strokeWidth="1.5" />
        {/* Axis of symmetry */}
        <line x1={cx+h*SCALE} y1={PAD} x2={cx+h*SCALE} y2={H-PAD} stroke="#f59e0b30" strokeWidth="1" strokeDasharray="4 3" />
        {/* Both curves overlap — shown same, vertex highlighted */}
        {points1.length>1 && <polyline points={points1.join(' ')} fill="none" stroke="#5b8dd9" strokeWidth="2.5" strokeLinejoin="round" clipPath="url(#csClip)" />}
        {/* Vertex */}
        {Math.abs(h)<=5 && Math.abs(k)<=5 && (
          <circle cx={cx+h*SCALE} cy={cy-k*SCALE} r="6" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
        )}
        <text x={cx+h*SCALE+8} y={cy-k*SCALE-8} fontSize="10" fill="#f59e0b" fontFamily="sans-serif">({h.toFixed(1)},{k.toFixed(1)})</text>
        <text x={10} y={18} fontSize="10" fill="#5b8dd9" fontFamily="sans-serif">{zh?'顶点式配方':'Vertex form'}</text>
      </svg>
    </div>
  );
};
export default CompletingSquare;
