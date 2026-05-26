import React, { useState } from 'react';
import { Language } from '../../types';

const MidpointFormula: React.FC<{ lang: Language }> = ({ lang }) => {
  const [x1, setX1] = useState(-3);
  const [y1, setY1] = useState(-2);
  const [x2, setX2] = useState(3);
  const [y2, setY2] = useState(4);
  const zh = lang === 'zh';
  const mx = +((x1+x2)/2).toFixed(2), my = +((y1+y2)/2).toFixed(2);

  const W = 280, H = 240, PAD = 32;
  const cx = W/2, cy = H/2;
  const SCALE = Math.min((W/2-PAD)/5,(H/2-PAD)/5);
  const toSx = (x:number) => cx+x*SCALE;
  const toSy = (y:number) => cy-y*SCALE;

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
        <div>M = ((x₁+x₂)/2, (y₁+y₂)/2)</div>
        <div>= (({x1}+{x2})/2, ({y1}+{y2})/2) = <strong style={{ color:'#f59e0b' }}>({mx}, {my})</strong></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        {[-4,-3,-2,-1,0,1,2,3,4].map(x=>(
          <line key={`x${x}`} x1={toSx(x)} y1={PAD} x2={toSx(x)} y2={H-PAD} stroke="#ffffff08" strokeWidth="1" />
        ))}
        {[-4,-3,-2,-1,0,1,2,3,4].map(y=>(
          <line key={`y${y}`} x1={PAD} y1={toSy(y)} x2={W-PAD} y2={toSy(y)} stroke="#ffffff08" strokeWidth="1" />
        ))}
        <line x1={PAD} y1={cy} x2={W-PAD} y2={cy} stroke="#ffffff25" strokeWidth="1.5" />
        <line x1={cx} y1={PAD} x2={cx} y2={H-PAD} stroke="#ffffff25" strokeWidth="1.5" />
        {/* Line segment */}
        <line x1={toSx(x1)} y1={toSy(y1)} x2={toSx(x2)} y2={toSy(y2)} stroke="#5b8dd9" strokeWidth="2" />
        {/* Half markers */}
        <line x1={toSx(x1)} y1={toSy(y1)} x2={toSx(mx)} y2={toSy(my)} stroke="#5b8dd9" strokeWidth="2.5" />
        <line x1={toSx(mx)} y1={toSy(my)} x2={toSx(x2)} y2={toSy(y2)} stroke="#5b8dd9" strokeWidth="2.5" strokeDasharray="1 0" />
        {/* Vertical/horizontal drop lines to midpoint */}
        <line x1={toSx(mx)} y1={toSy(my)} x2={toSx(mx)} y2={cy} stroke="#f59e0b30" strokeWidth="1" strokeDasharray="3 2" />
        <line x1={toSx(mx)} y1={toSy(my)} x2={cx}        y2={toSy(my)} stroke="#f59e0b30" strokeWidth="1" strokeDasharray="3 2" />
        {/* Axis ticks for midpoint */}
        <line x1={toSx(mx)-3} y1={cy} x2={toSx(mx)+3} y2={cy} stroke="#f59e0b" strokeWidth="2" />
        <line x1={cx} y1={toSy(my)-3} x2={cx} y2={toSy(my)+3} stroke="#f59e0b" strokeWidth="2" />
        {/* Points */}
        <circle cx={toSx(x1)} cy={toSy(y1)} r="5.5" fill="#ef4444" />
        <circle cx={toSx(x2)} cy={toSy(y2)} r="5.5" fill="#10b981" />
        <circle cx={toSx(mx)} cy={toSy(my)} r="6"   fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
        <text x={toSx(x1)-8} y={toSy(y1)-10} textAnchor="end" fontSize="10" fill="#ef4444" fontFamily="sans-serif">A({x1},{y1})</text>
        <text x={toSx(x2)+6} y={toSy(y2)-10} fontSize="10" fill="#10b981" fontFamily="sans-serif">B({x2},{y2})</text>
        <text x={toSx(mx)+8} y={toSy(my)+4} fontSize="11" fill="#f59e0b" fontFamily="sans-serif" fontWeight="bold">M({mx},{my})</text>
      </svg>
    </div>
  );
};
export default MidpointFormula;
