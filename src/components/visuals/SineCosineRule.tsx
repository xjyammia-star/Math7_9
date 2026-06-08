import React, { useState } from 'react';
import { Language } from '../../types';

const SineCosineRule: React.FC<{ lang: Language }> = ({ lang }) => {
  const [A, setA] = useState(50);  // angle A (degrees)
  const [B, setB] = useState(60);  // angle B (degrees)
  const [a, setA_] = useState(5);  // side a (opposite to A)
  const [mode, setMode] = useState<'sine'|'cosine'>('sine');
  const zh = lang === 'zh';

  const radA = A*Math.PI/180, radB = B*Math.PI/180;
  const C = 180-A-B;
  const radC = C*Math.PI/180;

  // Sine rule: a/sinA = b/sinB = c/sinC
  const k   = a / Math.sin(radA);
  const b_  = +(k * Math.sin(radB)).toFixed(3);
  const c_  = +(k * Math.sin(radC)).toFixed(3);

  // Cosine rule: c² = a²+b²-2ab·cosC (for the triangle with sides a, b_, angle C)
  const cosineC2 = +(a*a + b_*b_ - 2*a*b_*Math.cos(radC)).toFixed(3);
  const cosineC  = +Math.sqrt(Math.max(0,cosineC2)).toFixed(3);

  // Draw triangle
  const W = 280, H = 220, PAD = 28;
  const maxSide = Math.max(a, b_, c_, 1);
  const sc = Math.min((W-PAD*2)*0.55/maxSide, (H-PAD*2)*0.55/maxSide);
  // Place vertex A at bottom-left, B at bottom-right, C at top
  const vAx = PAD+20, vAy = H-PAD-10;
  const vBx = vAx + c_*sc, vBy = vAy;
  const vCx = vAx + b_*sc*Math.cos(radA), vCy = vAy - b_*sc*Math.sin(radA);

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {/* Mode toggle */}
      <div style={{ display:'flex', gap:6, marginBottom:10 }}>
        {(['sine','cosine'] as const).map(m=>(
          <button key={m} onClick={()=>setMode(m)}
            style={{ padding:'3px 12px', borderRadius:16, border:'1px solid', fontSize:11, cursor:'pointer',
              borderColor:mode===m?'#5b8dd9':'#445', background:mode===m?'#2a4a7f':'transparent',
              color:mode===m?'#fff':'#99a' }}>
            {m==='sine'?(zh?'正弦定理':'Sine Rule'):(zh?'余弦定理':'Cosine Rule')}
          </button>
        ))}
      </div>
      {([
        [zh?'角A°':'Angle A°', A, setA, 10, 160, 1],
        [zh?'角B°':'Angle B°', B, setB, 10, 160-A, 1],
        [zh?'边a':'Side a',   a, setA_, 1, 10, 0.5],
      ] as any[]).map(([lbl,val,setter,mn,mx,step]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <span style={{ width:60, color:'#aaa', fontSize:12 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e=>setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:36, textAlign:'right', fontWeight:600, fontSize:12 }}>{(+val).toFixed(step<1?1:0)}</span>
        </div>
      ))}
      <div style={{ fontSize:11, color:'#bbb', margin:'6px 0 8px', lineHeight:1.9 }}>
        <div style={{ color:'#aaa' }}>A={A}° B={B}° C=<strong style={{ color:'#f59e0b' }}>{C}°</strong></div>
        {mode==='sine' ? <>
          <div>a/sinA = b/sinB = c/sinC</div>
          <div>{a}/sin{A}° = <strong style={{ color:'#7db3ff' }}>{k.toFixed(3)}</strong></div>
          <div>b={b_}, c={c_}</div>
        </> : <>
          <div>c² = a²+b²−2ab·cosC</div>
          <div>= {a}²+{b_}²−2×{a}×{b_}×cos{C}° = <strong style={{ color:'#7db3ff' }}>{cosineC2}</strong></div>
          <div>c = {cosineC}</div>
        </>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        {C > 2 && <>
          <polygon points={`${vAx},${vAy} ${vBx},${vBy} ${vCx},${vCy}`}
            fill="rgba(80,140,220,0.25)" stroke="#5b8dd9" strokeWidth="1.5" />
          {/* Angle arcs */}
          <path d={`M${vAx+22},${vAy} A22,22 0 0,0 ${vAx+22*Math.cos(radA)},${vAy-22*Math.sin(radA)}`}
            fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <path d={`M${vBx-22},${vBy} A22,22 0 0,1 ${vBx-22*Math.cos(radB)},${vBy-22*Math.sin(radB)}`}
            fill="none" stroke="#10b981" strokeWidth="1.5" />
          {/* Labels */}
          <text x={vAx-14} y={vAy+4} fontSize="12" fill="#ef4444" fontFamily="sans-serif" fontWeight="bold">A</text>
          <text x={vBx+6} y={vBy+4} fontSize="12" fill="#10b981" fontFamily="sans-serif" fontWeight="bold">B</text>
          <text x={vCx} y={vCy-10} textAnchor="middle" fontSize="12" fill="#f59e0b" fontFamily="sans-serif" fontWeight="bold">C</text>
          <text x={(vBx+vCx)/2+8} y={(vBy+vCy)/2} fontSize="11" fill="#ffd" fontFamily="sans-serif">a={a}</text>
          <text x={(vAx+vCx)/2-10} y={(vAy+vCy)/2} textAnchor="end" fontSize="11" fill="#adf" fontFamily="sans-serif">b={b_}</text>
          <text x={(vAx+vBx)/2} y={vAy+14} textAnchor="middle" fontSize="11" fill="#dfa" fontFamily="sans-serif">c={c_}</text>
        </>}
        {C <= 2 && <text x={W/2} y={H/2} textAnchor="middle" fontSize="12" fill="#ef4444" fontFamily="sans-serif">{zh?'角度之和超过180°':'Angles exceed 180°'}</text>}
      </svg>
    </div>
  );
};
export default SineCosineRule;
