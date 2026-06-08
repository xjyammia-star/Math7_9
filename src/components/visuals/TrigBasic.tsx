import React, { useState } from 'react';
import { Language } from '../../types';

const TrigBasic: React.FC<{ lang: Language }> = ({ lang }) => {
  const [deg, setDeg] = useState(30);
  const rad  = deg*Math.PI/180;
  const sinV = +Math.sin(rad).toFixed(4);
  const cosV = +Math.cos(rad).toFixed(4);
  const tanV = Math.abs(Math.cos(rad))>0.001 ? +(Math.tan(rad)).toFixed(4) : '∞';

  const W = 280, H = 220, PAD = 32;
  // Place right angle at bottom-left of center area, hypotenuse fills ~55% of canvas
  const HYP = Math.min(W,H)*0.52;
  const ox = W*0.22, oy = H-PAD-10;
  const ax = ox+HYP*Math.cos(rad);
  const ay = oy-HYP*Math.sin(rad);

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <span style={{ width:20, color:'#aaa', fontSize:13 }}>θ°</span>
        <input type="range" min={5} max={85} step={1} value={deg}
          onChange={e=>setDeg(parseInt(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
        <span style={{ width:36, textAlign:'right', fontWeight:600, fontSize:13 }}>{deg}°</span>
      </div>
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 10px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:4, lineHeight:1.9 }}>
          <div>sin{deg}° = <strong style={{ color:'#ef4444' }}>{sinV}</strong></div>
          <div>cos{deg}° = <strong style={{ color:'#3b82f6' }}>{cosV}</strong></div>
          <div>tan{deg}° = <strong style={{ color:'#f59e0b' }}>{tanV}</strong></div>
        </div>
        <div style={{ fontSize:11, marginTop:2 }}>SOH · CAH · TOA</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        {/* Hypotenuse */}
        <line x1={ox} y1={oy} x2={ax} y2={ay} stroke="#aab" strokeWidth="2.5" />
        {/* Opposite (red) = vertical from (ax,oy) to (ax,ay) */}
        <line x1={ax} y1={oy} x2={ax} y2={ay} stroke="#ef4444" strokeWidth="3" />
        {/* Adjacent (blue) = horizontal from ox to ax */}
        <line x1={ox} y1={oy} x2={ax} y2={oy} stroke="#3b82f6" strokeWidth="3" />
        {/* Right angle mark at (ax, oy) */}
        <polyline points={`${ax-9},${oy} ${ax-9},${oy-9} ${ax},${oy-9}`} fill="none" stroke="#aab" strokeWidth="1.2" />
        {/* Angle arc at ox */}
        <path d={`M${ox+28},${oy} A28,28 0 0,0 ${ox+28*Math.cos(rad)},${oy-28*Math.sin(rad)}`}
          fill="none" stroke="#f59e0b" strokeWidth="1.8" />
        <text x={ox+34} y={oy-12} fontSize="12" fill="#f59e0b" fontFamily="sans-serif">{deg}°</text>
        {/* Labels */}
        <text x={(ox+ax)/2} y={oy+16} textAnchor="middle" fontSize="13" fill="#3b82f6" fontFamily="sans-serif" fontWeight="bold">adj = {cosV}</text>
        <text x={ax+10} y={(oy+ay)/2} fontSize="12" fill="#ef4444" fontFamily="sans-serif" fontWeight="bold">opp={sinV}</text>
        <text x={(ox+ax)/2-10} y={(oy+ay)/2-8} textAnchor="middle" fontSize="12" fill="#aab" fontFamily="sans-serif">hyp=1</text>
      </svg>
    </div>
  );
};
export default TrigBasic;
