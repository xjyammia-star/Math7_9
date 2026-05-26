import React, { useState } from 'react';
import { Language } from '../../types';

const ConeVolume: React.FC<{ lang: Language }> = ({ lang }) => {
  const [r, setR] = useState(3);
  const [h, setH] = useState(5);
  const volCone = +(Math.PI*r*r*h/3).toFixed(2);
  const volCyl  = +(Math.PI*r*r*h).toFixed(2);
  const zh = lang === 'zh';
  const W = 280, H = 240, PAD = 24;
  const sc  = Math.min(Math.min((W-PAD*2)*0.35,(H-PAD*2)*0.3)/Math.max(r,0.1), (H-PAD*2)*0.65/Math.max(h,0.1));
  const R   = r*sc, H2 = h*sc, ry = R*0.32;
  const cx  = W/2, oy = (H+H2)/2 + PAD*0.3;

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
        <div>V = ⅓πr²h = <strong style={{ color:'#7db3ff' }}>{volCone}</strong></div>
        <div style={{ fontSize:11 }}>{zh?'圆柱':'Cylinder'}={volCyl}，{zh?'圆锥':'cone'} = <strong style={{ color:'#f59e0b' }}>{zh?'圆柱的 1/3':'1/3 of cylinder'}</strong></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block' }}>
        <rect x={cx-R} y={oy-H2} width={R*2} height={H2} fill="none" stroke="#ffffff12" strokeWidth="1" strokeDasharray="4 3" />
        <ellipse cx={cx} cy={oy-H2} rx={R} ry={ry} fill="none" stroke="#ffffff12" strokeWidth="1" strokeDasharray="4 3" />
        {[1/3,2/3].map((f,i)=>(
          <line key={i} x1={cx-R*0.7} y1={oy-H2*f} x2={cx+R*0.7} y2={oy-H2*f} stroke="#f59e0b25" strokeWidth="1" strokeDasharray="3 2" />
        ))}
        <polygon points={`${cx-R},${oy} ${cx+R},${oy} ${cx},${oy-H2}`} fill="rgba(80,140,220,0.45)" stroke="#5b8dd9" strokeWidth="1.5" />
        <ellipse cx={cx} cy={oy} rx={R} ry={ry} fill="rgba(80,140,220,0.65)" stroke="#5b8dd9" strokeWidth="1.5" />
        <text x={cx+R+16} y={oy-H2/2} fontSize="12" fill="#f59e0b" fontFamily="sans-serif" dominantBaseline="middle">h={h}</text>
        <text x={cx+R/2} y={oy+ry+14} textAnchor="middle" fontSize="12" fill="#f59e0b" fontFamily="sans-serif">r={r}</text>
        <text x={cx} y={oy-H2*0.6} textAnchor="middle" fontSize="13" fill="#7db3ff" fontFamily="sans-serif" fontWeight="bold">V={volCone}</text>
        <text x={8} y={16} fontSize="10" fill="#555" fontFamily="sans-serif">{zh?'圆柱':'Cyl.'}={volCyl}</text>
      </svg>
    </div>
  );
};
export default ConeVolume;
