import React, { useState } from 'react';
import { Language } from '../../types';

const CylinderVolume: React.FC<{ lang: Language }> = ({ lang }) => {
  const [r, setR] = useState(3);
  const [h, setH] = useState(5);
  const vol      = +(Math.PI*r*r*h).toFixed(2);
  const baseArea = +(Math.PI*r*r).toFixed(2);
  const zh = lang === 'zh';
  const W = 280, H = 240, PAD = 24;
  const maxR = Math.min((W-PAD*2)*0.35,(H-PAD*2)*0.3);
  const maxH = (H-PAD*2)*0.65;
  const sc   = Math.min(maxR/Math.max(r,0.1), maxH/Math.max(h,0.1));
  const R    = r*sc, H2 = h*sc, ry = R*0.32;
  const cx   = W/2, oy = (H+H2)/2 + PAD*0.3;

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([['r', r, setR, 1, 6, 0.5], ['h', h, setH, 1, 10, 0.5]] as any[]).map(([lbl,val,setter,mn,mx,step]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <span style={{ width:12, color:'#aaa', fontSize:13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e=>setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:32, textAlign:'right', fontWeight:600, fontSize:13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 10px', lineHeight:1.8 }}>
        <div>V = πr²h = π×{r}²×{h} = <strong style={{ color:'#7db3ff' }}>{vol}</strong></div>
        <div style={{ fontSize:11 }}>{zh?'底面积':'Base area'} = {baseArea}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block' }}>
        <rect x={cx-R} y={oy-H2} width={R*2} height={H2} fill="rgba(80,140,220,0.35)" stroke="#5b8dd9" strokeWidth="1.5" />
        <ellipse cx={cx} cy={oy} rx={R} ry={ry} fill="rgba(80,140,220,0.6)" stroke="#5b8dd9" strokeWidth="1.5" />
        <ellipse cx={cx} cy={oy-H2} rx={R} ry={ry} fill="rgba(80,140,220,0.6)" stroke="#5b8dd9" strokeWidth="1.5" />
        <line x1={cx+R+8} y1={oy-H2} x2={cx+R+8} y2={oy} stroke="#f59e0b" strokeWidth="1.5" />
        <line x1={cx+R+4} y1={oy-H2} x2={cx+R+12} y2={oy-H2} stroke="#f59e0b" strokeWidth="1" />
        <line x1={cx+R+4} y1={oy} x2={cx+R+12} y2={oy} stroke="#f59e0b" strokeWidth="1" />
        <text x={cx+R+16} y={oy-H2/2} fontSize="12" fill="#f59e0b" fontFamily="sans-serif" dominantBaseline="middle">h={h}</text>
        <line x1={cx} y1={oy} x2={cx+R} y2={oy} stroke="#f59e0b" strokeWidth="1.5" />
        <text x={cx+R/2} y={oy+ry+14} textAnchor="middle" fontSize="12" fill="#f59e0b" fontFamily="sans-serif">r={r}</text>
        <text x={cx} y={oy-H2/2} textAnchor="middle" fontSize="13" fill="#7db3ff" fontFamily="sans-serif" fontWeight="bold">V={vol}</text>
      </svg>
    </div>
  );
};
export default CylinderVolume;
