import React, { useState } from 'react';
import { Language } from '../../types';

const LinearFunc: React.FC<{ lang: Language }> = ({ lang }) => {
  const [k, setK] = useState(1);
  const [b, setB] = useState(0);
  const zh = lang === 'zh';

  const W = 280, H = 200, PAD = 28;
  const cx = W/2, cy = H/2;
  const SCALE = Math.min((W/2-PAD)/5, (H/2-PAD)/5);
  const clampY = (y: number) => Math.max(PAD, Math.min(H-PAD, cy - y*SCALE));
  const xMin = -(cx-PAD)/SCALE, xMax = (cx-PAD)/SCALE;
  const xInt = k !== 0 ? -b/k : null;

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([[zh?'k (斜率)':'k (slope)', k, setK, -4, 4, 0.5], [zh?'b (截距)':'b (intercept)', b, setB, -5, 5, 0.5]] as any[]).map(([lbl,val,setter,mn,mx,step]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
          <span style={{ width:80, color:'#aaa', fontSize:12 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e => setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:36, textAlign:'right', fontWeight:600, fontSize:13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 8px', lineHeight:1.8 }}>
        <div>y = <strong style={{ color:'#7db3ff' }}>{k}x {b>=0?'+':''}{b}</strong></div>
        {xInt !== null && <div style={{ fontSize:11 }}>{zh?'x轴':'x-axis'}: ({xInt.toFixed(2)}, 0) | {zh?'y轴':'y-axis'}: (0, {b})</div>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        <defs><clipPath id="plotClip"><rect x={PAD} y={PAD} width={W-PAD*2} height={H-PAD*2} /></clipPath></defs>
        {[-4,-3,-2,-1,0,1,2,3,4].map(x => (
          <line key={`gx${x}`} x1={cx+x*SCALE} y1={PAD} x2={cx+x*SCALE} y2={H-PAD} stroke="#ffffff0a" strokeWidth="1" />
        ))}
        {[-3,-2,-1,0,1,2,3].map(y => (
          <line key={`gy${y}`} x1={PAD} y1={cy-y*SCALE} x2={W-PAD} y2={cy-y*SCALE} stroke="#ffffff0a" strokeWidth="1" />
        ))}
        <line x1={PAD} y1={cy} x2={W-PAD} y2={cy} stroke="#ffffff30" strokeWidth="1.5" />
        <line x1={cx} y1={PAD} x2={cx} y2={H-PAD} stroke="#ffffff30" strokeWidth="1.5" />
        <line x1={cx+xMin*SCALE} y1={clampY(k*xMin+b)} x2={cx+xMax*SCALE} y2={clampY(k*xMax+b)}
          stroke="#5b8dd9" strokeWidth="2.5" strokeLinecap="round" clipPath="url(#plotClip)" />
        {Math.abs(b) <= 4 && <circle cx={cx} cy={cy-b*SCALE} r="4.5" fill="#f59e0b" />}
        {xInt !== null && Math.abs(xInt) <= 4.8 && <circle cx={cx+xInt*SCALE} cy={cy} r="4.5" fill="#10b981" />}
        <text x={12} y={16} fontSize="11" fill="#7db3ff" fontFamily="sans-serif">k={k} {k>0?'↗':k<0?'↘':'→'}</text>
      </svg>
    </div>
  );
};
export default LinearFunc;
