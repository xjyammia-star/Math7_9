import React, { useState } from 'react';
import { Language } from '../../types';

const TriangleArea: React.FC<{ lang: Language }> = ({ lang }) => {
  const [base, setBase] = useState(8);
  const [height, setHeight] = useState(5);
  const area = +(0.5*base*height).toFixed(2);
  const zh = lang === 'zh';
  const W = 280, H = 220, PAD = 28;
  const sc = Math.min((W-PAD*2-40)/(base*1.4),(H-PAD*2-30)/(height*1.3));
  const B = base*sc, HH = height*sc;
  const ox = (W-B)/2, oy = H-PAD-16;
  const apex_x = ox+B*0.35;

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([[zh?'底':'base', base, setBase, 1, 12], [zh?'高':'height', height, setHeight, 1, 10]] as any[]).map(([lbl,val,setter,mn,mx]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <span style={{ width:40, color:'#aaa', fontSize:13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={0.5} value={val}
            onChange={e=>setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:36, textAlign:'right', fontWeight:600, fontSize:13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 10px', lineHeight:1.8 }}>
        <div>S = ½ × {zh?'底':'base'} × {zh?'高':'height'} = ½ × {base} × {height} = <strong style={{ color:'#7db3ff' }}>{area}</strong></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        <line x1={PAD} y1={oy} x2={W-PAD} y2={oy} stroke="#ffffff15" strokeWidth="1" />
        <polygon points={`${ox},${oy} ${ox+B},${oy} ${apex_x+B*0.65},${oy-HH} ${apex_x},${oy-HH}`}
          fill="rgba(80,140,220,0.1)" stroke="#26c" strokeWidth="1" strokeDasharray="5 3" />
        <polygon points={`${ox},${oy} ${ox+B},${oy} ${apex_x},${oy-HH}`}
          fill="rgba(80,140,220,0.55)" stroke="#5b8dd9" strokeWidth="1.5" />
        <line x1={apex_x} y1={oy} x2={apex_x} y2={oy-HH} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
        <polyline points={`${apex_x+7},${oy} ${apex_x+7},${oy-7} ${apex_x},${oy-7}`} fill="none" stroke="#f59e0b" strokeWidth="1" />
        <text x={ox+B/2} y={oy+16} textAnchor="middle" fontSize="12" fill="#7db3ff" fontFamily="sans-serif">{zh?'底':'base'}={base}</text>
        <text x={apex_x+10} y={oy-HH/2} fontSize="12" fill="#f59e0b" fontFamily="sans-serif">{zh?'高':'h'}={height}</text>
        <text x={W/2} y={oy-HH/2-8} textAnchor="middle" fontSize="12" fill="#7db3ff" fontFamily="sans-serif" fontWeight="bold">S={area}</text>
      </svg>
    </div>
  );
};
export default TriangleArea;
