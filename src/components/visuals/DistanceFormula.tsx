import React, { useState } from 'react';
import { Language } from '../../types';

const DistanceFormula: React.FC<{ lang: Language }> = ({ lang }) => {
  const [x1, setX1] = useState(-2);
  const [y1, setY1] = useState(-2);
  const [x2, setX2] = useState(3);
  const [y2, setY2] = useState(2);
  const zh = lang === 'zh';
  const dx = x2-x1, dy = y2-y1;
  const d  = +Math.sqrt(dx*dx+dy*dy).toFixed(3);
  const mx = +((x1+x2)/2).toFixed(2), my = +((y1+y2)/2).toFixed(2);

  const W = 280, H = 240, PAD = 32;
  const cx = W/2, cy = H/2;
  const SCALE = Math.min((W/2-PAD)/5,(H/2-PAD)/5);

  const sx1=cx+x1*SCALE, sy1=cy-y1*SCALE;
  const sx2=cx+x2*SCALE, sy2=cy-y2*SCALE;
  const smx=cx+mx*SCALE,  smy=cy-my*SCALE;

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([
        ['x₁', x1, setX1], ['y₁', y1, setY1],
        ['x₂', x2, setX2], ['y₂', y2, setY2],
      ] as any[]).map(([lbl,val,setter]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <span style={{ width:20, color:'#aaa', fontSize:12 }}>{lbl}</span>
          <input type="range" min={-5} max={5} step={0.5} value={val}
            onChange={e=>setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:32, textAlign:'right', fontWeight:600, fontSize:12 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize:11, color:'#bbb', margin:'6px 0 8px', lineHeight:1.9 }}>
        <div>d = √((x₂−x₁)²+(y₂−y₁)²) = √({dx.toFixed(1)}²+{dy.toFixed(1)}²) = <strong style={{ color:'#7db3ff' }}>{d}</strong></div>
        <div>{zh?'中点':'Midpoint'} M = ({mx}, {my})</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        <defs><clipPath id="dfClip"><rect x={PAD} y={PAD} width={W-PAD*2} height={H-PAD*2} /></clipPath></defs>
        {[-4,-3,-2,-1,0,1,2,3,4].map(x=>(
          <line key={`x${x}`} x1={cx+x*SCALE} y1={PAD} x2={cx+x*SCALE} y2={H-PAD} stroke="#ffffff08" strokeWidth="1" />
        ))}
        {[-4,-3,-2,-1,0,1,2,3,4].map(y=>(
          <line key={`y${y}`} x1={PAD} y1={cy-y*SCALE} x2={W-PAD} y2={cy-y*SCALE} stroke="#ffffff08" strokeWidth="1" />
        ))}
        <line x1={PAD} y1={cy} x2={W-PAD} y2={cy} stroke="#ffffff25" strokeWidth="1.5" />
        <line x1={cx} y1={PAD} x2={cx} y2={H-PAD} stroke="#ffffff25" strokeWidth="1.5" />
        {/* Right angle helper lines */}
        <line x1={sx1} y1={sy1} x2={sx2} y2={sy1} stroke="#f59e0b50" strokeWidth="1" strokeDasharray="4 2" clipPath="url(#dfClip)" />
        <line x1={sx2} y1={sy1} x2={sx2} y2={sy2} stroke="#f59e0b50" strokeWidth="1" strokeDasharray="4 2" clipPath="url(#dfClip)" />
        {/* dx label */}
        <text x={(sx1+sx2)/2} y={sy1+13} textAnchor="middle" fontSize="10" fill="#f59e0b" fontFamily="sans-serif">Δx={dx.toFixed(1)}</text>
        <text x={sx2+14} y={(sy1+sy2)/2} textAnchor="middle" fontSize="10" fill="#f59e0b" fontFamily="sans-serif">Δy={dy.toFixed(1)}</text>
        {/* Distance line */}
        <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke="#5b8dd9" strokeWidth="2.5" clipPath="url(#dfClip)" />
        {/* Points */}
        <circle cx={sx1} cy={sy1} r="5.5" fill="#ef4444" />
        <circle cx={sx2} cy={sy2} r="5.5" fill="#10b981" />
        <circle cx={smx} cy={smy} r="4" fill="#f59e0b" />
        {/* Labels */}
        <text x={sx1-6} y={sy1-9} textAnchor="end" fontSize="10" fill="#ef4444" fontFamily="sans-serif">P₁({x1},{y1})</text>
        <text x={sx2+6} y={sy2-9} fontSize="10" fill="#10b981" fontFamily="sans-serif">P₂({x2},{y2})</text>
        <text x={smx+6} y={smy-6} fontSize="10" fill="#f59e0b" fontFamily="sans-serif">M</text>
        <text x={(sx1+sx2)/2} y={(sy1+sy2)/2-10} textAnchor="middle" fontSize="11" fill="#7db3ff" fontFamily="sans-serif" fontWeight="bold">d={d}</text>
      </svg>
    </div>
  );
};
export default DistanceFormula;
