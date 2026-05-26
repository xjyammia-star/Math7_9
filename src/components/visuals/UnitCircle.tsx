import React, { useState } from 'react';
import { Language } from '../../types';

const UnitCircle: React.FC<{ lang: Language }> = ({ lang }) => {
  const [deg, setDeg] = useState(45);
  const rad  = deg*Math.PI/180;
  const cosV = +Math.cos(rad).toFixed(3);
  const sinV = +Math.sin(rad).toFixed(3);
  const zh = lang === 'zh';
  const W = 280, H = 260;
  const cx = W/2, cy = H/2+8;
  const R  = Math.min(W,H)*0.36;
  const px = cx+R*Math.cos(rad), py = cy-R*Math.sin(rad);
  const specials = [0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330];

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <span style={{ width:20, color:'#aaa', fontSize:13 }}>θ°</span>
        <input type="range" min={0} max={360} step={1} value={deg}
          onChange={e=>setDeg(parseInt(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
        <span style={{ width:36, textAlign:'right', fontWeight:600, fontSize:13 }}>{deg}°</span>
      </div>
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 10px', lineHeight:1.9 }}>
        <div>{zh?'点坐标':'Coordinates'}: (<strong style={{ color:'#3b82f6' }}>{cosV}</strong>, <strong style={{ color:'#ef4444' }}>{sinV}</strong>)</div>
        <div>sin²θ + cos²θ = {+(sinV**2+cosV**2).toFixed(2)} ✓</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        <line x1={cx-R-16} y1={cy} x2={cx+R+16} y2={cy} stroke="#ffffff22" strokeWidth="1" />
        <line x1={cx} y1={cy-R-16} x2={cx} y2={cy+R+16} stroke="#ffffff22" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#ffffff18" strokeWidth="1.5" />
        {specials.map(d=>{
          const r2=d*Math.PI/180;
          return <circle key={d} cx={cx+R*Math.cos(r2)} cy={cy-R*Math.sin(r2)} r="2.5" fill="#ffffff18" />;
        })}
        <line x1={cx} y1={cy} x2={cx+R*cosV} y2={cy} stroke="#3b82f6" strokeWidth="3" />
        <line x1={cx+R*cosV} y1={cy} x2={px} y2={py} stroke="#3b82f660" strokeWidth="1.5" strokeDasharray="4 2" />
        <line x1={cx} y1={cy} x2={cx} y2={cy-R*sinV} stroke="#ef4444" strokeWidth="3" />
        <line x1={cx} y1={cy-R*sinV} x2={px} y2={py} stroke="#ef444460" strokeWidth="1.5" strokeDasharray="4 2" />
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#aab" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="4" fill="#f59e0b" />
        <circle cx={px} cy={py} r="6" fill="#f59e0b" />
        <text x={cx+R*cosV/2} y={cy+16} textAnchor="middle" fontSize="12" fill="#3b82f6" fontFamily="sans-serif" fontWeight="bold">cos={cosV}</text>
        <text x={cx-20} y={cy-R*sinV/2} textAnchor="end" fontSize="12" fill="#ef4444" fontFamily="sans-serif" fontWeight="bold">sin={sinV}</text>
      </svg>
    </div>
  );
};
export default UnitCircle;
