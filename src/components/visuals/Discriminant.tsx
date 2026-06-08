import React, { useState } from 'react';
import { Language } from '../../types';

const Discriminant: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(-2);
  const zh = lang === 'zh';
  const delta = b*b - 4*a*c;
  const W = 280, H = 220, PAD = 32;
  const cx = W/2, cy = H/2+10;
  const SCALE = Math.min((W/2-PAD)/5, (H/2-PAD)/5);

  const points: string[] = [];
  for (let px=-6; px<=6; px+=0.08) {
    const py = a*px*px+b*px+c;
    const sx = cx+px*SCALE, sy = cy-py*SCALE;
    if (sy>PAD && sy<H-PAD+10) points.push(`${sx},${sy}`);
  }

  const roots = delta > 0
    ? [(-b+Math.sqrt(delta))/(2*a), (-b-Math.sqrt(delta))/(2*a)]
    : delta === 0 ? [-b/(2*a)] : [];

  const statusColor = delta > 0 ? '#10b981' : delta === 0 ? '#f59e0b' : '#ef4444';
  const statusText  = delta > 0
    ? (zh ? `Δ>0，两个不同实根` : `Δ>0, two distinct roots`)
    : delta === 0
    ? (zh ? `Δ=0，两个相等实根` : `Δ=0, one repeated root`)
    : (zh ? `Δ<0，无实根` : `Δ<0, no real roots`);

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([['a', a, setA, -3, 3, 0.5], ['b', b, setB, -6, 6, 0.5], ['c', c, setC, -5, 5, 0.5]] as any[]).map(([lbl,val,setter,mn,mx,step]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
          <span style={{ width:12, color:'#aaa', fontSize:13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e=>setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:36, textAlign:'right', fontWeight:600, fontSize:13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 6px', lineHeight:1.8 }}>
        <div>Δ = b²−4ac = {b}²−4×{a}×{c} = <strong style={{ color: statusColor }}>{delta.toFixed(2)}</strong></div>
        <div style={{ color: statusColor, fontWeight:600, fontSize:11 }}>{statusText}</div>
        {roots.length > 0 && <div style={{ fontSize:11 }}>x = {roots.map(r=>r.toFixed(3)).join(', ')}</div>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        <defs><clipPath id="dClip"><rect x={PAD} y={PAD} width={W-PAD*2} height={H-PAD*2} /></clipPath></defs>
        {[-4,-3,-2,-1,0,1,2,3,4].map(x=>(
          <line key={`x${x}`} x1={cx+x*SCALE} y1={PAD} x2={cx+x*SCALE} y2={H-PAD} stroke="#ffffff08" strokeWidth="1" />
        ))}
        <line x1={PAD} y1={cy} x2={W-PAD} y2={cy} stroke="#ffffff25" strokeWidth="1.5" />
        <line x1={cx} y1={PAD} x2={cx} y2={H-PAD} stroke="#ffffff25" strokeWidth="1.5" />
        {points.length>1 && <polyline points={points.join(' ')} fill="none" stroke="#5b8dd9" strokeWidth="2.5" strokeLinejoin="round" clipPath="url(#dClip)" />}
        {roots.map((r,i) => Math.abs(r)<=5 && (
          <g key={i}>
            <circle cx={cx+r*SCALE} cy={cy} r="6" fill={statusColor} stroke="#fff" strokeWidth="1.5" />
            <text x={cx+r*SCALE} y={cy+18} textAnchor="middle" fontSize="10" fill={statusColor} fontFamily="sans-serif">{r.toFixed(2)}</text>
          </g>
        ))}
        <text x={10} y={18} fontSize="10" fill={statusColor} fontFamily="sans-serif" fontWeight="bold">Δ={delta.toFixed(1)}</text>
      </svg>
    </div>
  );
};
export default Discriminant;
