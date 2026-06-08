import React, { useState } from 'react';
import { Language } from '../../types';

const PyramidVolume: React.FC<{ lang: Language }> = ({ lang }) => {
  const [base, setBase] = useState(5);
  const [h, setH]       = useState(6);
  const zh = lang === 'zh';
  const baseArea = +(base*base).toFixed(2);
  const volPyr   = +(baseArea*h/3).toFixed(2);
  const volPrism = +(baseArea*h).toFixed(2);

  const W = 280, H = 240, PAD = 24;
  const sc  = Math.min((W-PAD*2)*0.3/base, (H-PAD*2)*0.55/h);
  const B   = base*sc, HH = h*sc;
  const cx  = W/2, oy = H-PAD-16;
  const skew = B*0.35;

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([
        [zh?'底边':'base', base, setBase, 1, 8],
        [zh?'高 h':'height h', h, setH, 1, 10],
      ] as any[]).map(([lbl,val,setter,mn,mx]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <span style={{ width:52, color:'#aaa', fontSize:12 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={0.5} value={val}
            onChange={e=>setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:32, textAlign:'right', fontWeight:600, fontSize:13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 10px', lineHeight:1.9 }}>
        <div>V = ⅓ × {zh?'底面积':'base'} × h = ⅓×{baseArea}×{h} = <strong style={{ color:'#7db3ff' }}>{volPyr}</strong></div>
        <div style={{ fontSize:11 }}>{zh?'棱柱体积':'Prism'} = {volPrism} → {zh?'棱锥':'Pyramid'} = {zh?'棱柱的 1/3':'1/3 of prism'}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block' }}>
        {/* Prism ghost */}
        <polygon points={`${cx-B/2},${oy} ${cx+B/2},${oy} ${cx+B/2+skew},${oy-HH} ${cx-B/2+skew},${oy-HH}`}
          fill="none" stroke="#ffffff12" strokeWidth="1" strokeDasharray="4 3" />
        <polygon points={`${cx-B/2+skew},${oy-HH} ${cx+B/2+skew},${oy-HH} ${cx+B/2},${oy} ${cx-B/2},${oy}`}
          fill="rgba(255,255,255,0.03)" stroke="#ffffff12" strokeWidth="0.5" strokeDasharray="3 3" />
        {/* 1/3 markers */}
        {[1/3,2/3].map((f,i)=>(
          <line key={i} x1={cx-B/2*(1-f)} y1={oy-HH*f} x2={cx+B/2*(1-f)} y2={oy-HH*f}
            stroke="#f59e0b20" strokeWidth="1" strokeDasharray="3 2" />
        ))}
        {/* Pyramid faces */}
        <polygon points={`${cx-B/2},${oy} ${cx+B/2},${oy} ${cx+skew/2},${oy-HH}`}
          fill="rgba(80,140,220,0.45)" stroke="#5b8dd9" strokeWidth="1" />
        <polygon points={`${cx+B/2},${oy} ${cx+B/2+skew},${oy} ${cx+skew/2},${oy-HH}`}
          fill="rgba(80,140,220,0.3)" stroke="#5b8dd9" strokeWidth="1" />
        {/* Base */}
        <polygon points={`${cx-B/2},${oy} ${cx+B/2},${oy} ${cx+B/2+skew},${oy} ${cx-B/2+skew},${oy}`}
          fill="rgba(80,140,220,0.6)" stroke="#5b8dd9" strokeWidth="1" />
        {/* Labels */}
        <text x={cx} y={oy+16} textAnchor="middle" fontSize="11" fill="#f59e0b" fontFamily="sans-serif">{zh?'底边':'base'}={base}</text>
        <text x={cx+B/2+skew+10} y={oy-HH/2} fontSize="11" fill="#f59e0b" fontFamily="sans-serif" dominantBaseline="middle">h={h}</text>
        <text x={cx+skew/4} y={oy-HH*0.55} textAnchor="middle" fontSize="13" fill="#7db3ff" fontFamily="sans-serif" fontWeight="bold">V={volPyr}</text>
      </svg>
    </div>
  );
};
export default PyramidVolume;
