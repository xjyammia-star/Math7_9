import React, { useState } from 'react';
import { Language } from '../../types';

const TrapezoidArea: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a, setA] = useState(8);
  const [b, setB] = useState(5);
  const [h, setH] = useState(4);
  const zh = lang === 'zh';
  const area = +(0.5*(a+b)*h).toFixed(2);

  const W = 280, H = 210, PAD = 28;
  const sc = Math.min((W-PAD*2-20)/(Math.max(a,b)*1.2), (H-PAD*2-20)/(h*1.5));
  const A = a*sc, B = b*sc, HH = h*sc;
  const ox = (W-A)/2, oy = H-PAD-16;
  const bx = ox + (A-B)/2; // top base centered

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([
        [zh?'下底 a':'base a', a, setA, 1, 12],
        [zh?'上底 b':'top b',  b, setB, 1, 12],
        [zh?'高 h':'height h', h, setH, 1, 8],
      ] as any[]).map(([lbl,val,setter,mn,mx]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
          <span style={{ width:56, color:'#aaa', fontSize:12 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={0.5} value={val}
            onChange={e=>setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:32, textAlign:'right', fontWeight:600, fontSize:13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 10px', lineHeight:1.8 }}>
        <div>S = ½(a+b)×h = ½×({a}+{b})×{h} = <strong style={{ color:'#7db3ff' }}>{area}</strong></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        {/* Mirror trapezoid ghost (parallelogram) */}
        <polygon points={`${ox},${oy} ${ox+A},${oy} ${bx+B},${oy-HH} ${bx},${oy-HH}`}
          fill="rgba(80,140,220,0.12)" stroke="#26c" strokeWidth="1" strokeDasharray="5 3" />
        {/* Mirrored ghost */}
        <polygon points={`${ox+A},${oy} ${ox},${oy} ${bx},${oy-HH} ${bx+B},${oy-HH}`}
          fill="rgba(80,140,220,0.08)" stroke="#26c" strokeWidth="0.5" strokeDasharray="3 3" />
        {/* Main trapezoid */}
        <polygon points={`${ox},${oy} ${ox+A},${oy} ${bx+B},${oy-HH} ${bx},${oy-HH}`}
          fill="rgba(80,140,220,0.55)" stroke="#5b8dd9" strokeWidth="1.5" />
        {/* Height dashed */}
        <line x1={bx} y1={oy} x2={bx} y2={oy-HH} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
        <polyline points={`${bx+6},${oy} ${bx+6},${oy-6} ${bx},${oy-6}`} fill="none" stroke="#f59e0b" strokeWidth="1" />
        {/* Labels */}
        <text x={ox+A/2} y={oy+16} textAnchor="middle" fontSize="12" fill="#7db3ff" fontFamily="sans-serif">{zh?'下底':'base'} a={a}</text>
        <text x={bx+B/2} y={oy-HH-8} textAnchor="middle" fontSize="12" fill="#7db3ff" fontFamily="sans-serif">{zh?'上底':'top'} b={b}</text>
        <text x={bx+10} y={oy-HH/2} fontSize="12" fill="#f59e0b" fontFamily="sans-serif">h={h}</text>
        <text x={W/2} y={oy-HH/2+4} textAnchor="middle" fontSize="13" fill="#7db3ff" fontFamily="sans-serif" fontWeight="bold">S={area}</text>
      </svg>
    </div>
  );
};
export default TrapezoidArea;
