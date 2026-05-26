import React, { useState } from 'react';
import { Language } from '../../types';

const SphereVolume: React.FC<{ lang: Language }> = ({ lang }) => {
  const [r, setR] = useState(4);
  const zh = lang === 'zh';
  const vol  = +(4/3*Math.PI*r*r*r).toFixed(2);
  const surf = +(4*Math.PI*r*r).toFixed(2);

  const W = 280, H = 240;
  const cx = W/2, cy = H/2+8;
  const R = Math.min(W,H)*0.36;

  const nRings = 6;

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <span style={{ width:12, color:'#aaa', fontSize:13 }}>r</span>
        <input type="range" min={1} max={6} step={0.5} value={r}
          onChange={e=>setR(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
        <span style={{ width:32, textAlign:'right', fontWeight:600, fontSize:13 }}>{r}</span>
      </div>
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 10px', lineHeight:1.9 }}>
        <div>V = ⁴⁄₃πr³ = ⁴⁄₃×π×{r}³ = <strong style={{ color:'#7db3ff' }}>{vol}</strong></div>
        <div style={{ fontSize:11 }}>{zh?'表面积':'Surface area'} S = 4πr² = <strong style={{ color:'#f59e0b' }}>{surf}</strong></div>
        <div style={{ fontSize:11 }}>{zh?`r 增大1倍 → 体积增大 8 倍`:`Double r → volume ×8`}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        {/* Sphere fill */}
        <circle cx={cx} cy={cy} r={R} fill="rgba(80,140,220,0.25)" stroke="#5b8dd9" strokeWidth="2" />
        {/* Latitude rings */}
        {Array.from({length:nRings-1}, (_,i) => {
          const angle = (Math.PI/(nRings)) * (i+1);
          const ry2   = R * Math.abs(Math.sin(angle));
          const y2    = cy - R * Math.cos(angle);
          return <ellipse key={i} cx={cx} cy={y2} rx={ry2} ry={ry2*0.28} fill="none" stroke="#5b8dd950" strokeWidth="0.8" />;
        })}
        {/* Equator */}
        <ellipse cx={cx} cy={cy} rx={R} ry={R*0.28} fill="none" stroke="#5b8dd9" strokeWidth="1.2" />
        {/* Radius */}
        <line x1={cx} y1={cy} x2={cx+R*0.707} y2={cy-R*0.707} stroke="#f59e0b" strokeWidth="1.8" />
        <circle cx={cx} cy={cy} r="3.5" fill="#f59e0b" />
        <text x={cx+R*0.36} y={cy-R*0.42} textAnchor="middle" fontSize="12" fill="#f59e0b" fontFamily="sans-serif">r={r}</text>
        <text x={cx} y={cy+R*0.5} textAnchor="middle" fontSize="14" fill="#7db3ff" fontFamily="sans-serif" fontWeight="bold">V={vol}</text>
      </svg>
    </div>
  );
};
export default SphereVolume;
