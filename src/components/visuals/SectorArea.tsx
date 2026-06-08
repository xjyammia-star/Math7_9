import React, { useState } from 'react';
import { Language } from '../../types';

const SectorArea: React.FC<{ lang: Language }> = ({ lang }) => {
  const [r, setR] = useState(5);
  const [theta, setTheta] = useState(90);
  const area   = +(theta/360*Math.PI*r*r).toFixed(2);
  const arcLen = +(theta/360*2*Math.PI*r).toFixed(2);
  const zh = lang === 'zh';
  const W = 280, H = 240;
  const cx = W/2, cy = H/2 + 8;
  const R = Math.min(W,H)*0.38;
  const rad = theta*Math.PI/180;
  const ex = cx+R*Math.cos(-rad), ey = cy+R*Math.sin(-rad);
  const large = theta>180?1:0;

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([['r', r, setR, 1, 8, 0.5], ['θ°', theta, setTheta, 10, 360, 10]] as any[]).map(([lbl,val,setter,mn,mx,step]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <span style={{ width:20, color:'#aaa', fontSize:13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e=>setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:36, textAlign:'right', fontWeight:600, fontSize:13 }}>{(+val).toFixed(0)}</span>
        </div>
      ))}
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 10px', lineHeight:1.8 }}>
        <div>S = (θ/360)×πr² = ({theta}/360)×π×{r}² = <strong style={{ color:'#7db3ff' }}>{area}</strong></div>
        <div style={{ fontSize:11 }}>{zh?'弧长':'Arc length'} = {arcLen}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        <circle cx={cx} cy={cy} r={R} fill="rgba(80,140,220,0.1)" stroke="#ffffff15" strokeWidth="1" />
        {theta<360
          ? <path d={`M${cx},${cy} L${cx+R},${cy} A${R},${R} 0 ${large},0 ${ex},${ey} Z`}
              fill="rgba(80,140,220,0.55)" stroke="#5b8dd9" strokeWidth="1.5" />
          : <circle cx={cx} cy={cy} r={R} fill="rgba(80,140,220,0.55)" stroke="#5b8dd9" strokeWidth="1.5" />
        }
        <line x1={cx} y1={cy} x2={cx+R} y2={cy} stroke="#f59e0b" strokeWidth="1.5" />
        <text x={cx+R/2} y={cy-8} textAnchor="middle" fontSize="11" fill="#f59e0b" fontFamily="sans-serif">r={r}</text>
        <text x={cx+14} y={cy-20} fontSize="11" fill="#aab" fontFamily="sans-serif">θ={theta}°</text>
        <text x={cx} y={cy+R*0.45} textAnchor="middle" fontSize="14" fill="#7db3ff" fontFamily="sans-serif" fontWeight="bold">S={area}</text>
      </svg>
    </div>
  );
};
export default SectorArea;
