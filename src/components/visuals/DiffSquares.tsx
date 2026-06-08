import React, { useState } from 'react';
import { Language } from '../../types';

const DiffSquares: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a, setA] = useState(8);
  const [b, setB] = useState(4);
  const safeB  = Math.min(b, a-0.5);
  const zh     = lang === 'zh';
  const result = +((a+safeB)*(a-safeB)).toFixed(2);
  const a2 = +(a*a).toFixed(2), b2 = +(safeB*safeB).toFixed(2);
  const W = 280, H = 260;
  const sc = (Math.min(W,H)*0.70)/a;
  const A = a*sc, B = safeB*sc, AB = (a-safeB)*sc;
  const ox = (W-A)/2, oy = (H-A)/2;

  const [step, setStep] = useState('rearrange');
  const steps = [
    { key:'both',      label: zh?'a² 和 b²':'a² and b²' },
    { key:'diff',      label: zh?'L形区域':'L-shape area' },
    { key:'rearrange', label: zh?'重新拼合':'Rearranged' },
  ];

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([['a', a, setA, 1.5, 12], ['b', safeB, (v:number)=>setB(v), 0.5, a-0.5]] as any[]).map(([lbl,val,setter,mn,mx]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <span style={{ width:12, color:'#aaa', fontSize:13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={0.5} value={val}
            onChange={e=>setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:36, textAlign:'right', fontWeight:600, fontSize:13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize:12, color:'#bbb', margin:'8px 0', lineHeight:1.8 }}>
        <div>a² − b² = (a+b)(a−b)</div>
        <div>{a2} − {b2} = ({a}+{safeB})×({a}−{safeB}) = <strong style={{ color:'#7db3ff' }}>{result}</strong></div>
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
        {steps.map(s=>(
          <button key={s.key} onClick={()=>setStep(s.key)}
            style={{ padding:'3px 10px', borderRadius:20, border:'1px solid', fontSize:11, cursor:'pointer',
              borderColor:step===s.key?'#5b8dd9':'#445', background:step===s.key?'#2a4a7f':'transparent',
              color:step===s.key?'#fff':'#99a' }}>
            {s.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block' }}>
        {step==='both' && <>
          <rect x={ox} y={oy} width={A} height={A} fill="rgba(200,100,140,0.6)" stroke="#a06" strokeWidth="1" />
          <text x={ox+A/2} y={oy+A/2} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="#fff" fontFamily="sans-serif" fontWeight="bold">a²</text>
          <rect x={ox+A+16} y={oy} width={B} height={B} fill="rgba(80,180,100,0.6)" stroke="#0a5" strokeWidth="1" />
          <text x={ox+A+16+B/2} y={oy+B/2} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#fff" fontFamily="sans-serif" fontWeight="bold">b²</text>
        </>}
        {step==='diff' && <>
          <rect x={ox} y={oy} width={A} height={A} fill="rgba(200,100,140,0.25)" stroke="#777" strokeWidth="1" />
          <rect x={ox} y={oy} width={AB} height={A} fill="rgba(80,140,220,0.7)" stroke="#26c" strokeWidth="1" />
          <rect x={ox+AB} y={oy} width={B} height={AB} fill="rgba(80,140,220,0.7)" stroke="#26c" strokeWidth="1" />
          <rect x={ox+AB} y={oy+AB} width={B} height={B} fill="rgba(200,100,140,0.3)" stroke="#777" strokeWidth="1" />
          <text x={ox+A/2} y={H-16} textAnchor="middle" fontSize="11" fill="#7db3ff" fontFamily="sans-serif">{zh?'蓝色L形':'Blue L-shape'} = a²−b²</text>
        </>}
        {step==='rearrange' && (()=>{
          const rw=(a+safeB)*sc, rh=AB, rx=(W-rw)/2, ry=(H-rh)/2;
          return <>
            <rect x={rx} y={ry} width={rw} height={rh} fill="rgba(80,140,220,0.75)" stroke="#26c" strokeWidth="1.5" />
            <text x={rx+rw/2} y={ry+rh/2} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#fff" fontFamily="sans-serif" fontWeight="bold">(a+b)×(a−b)</text>
            <text x={rx+rw/2} y={ry-10} textAnchor="middle" fontSize="11" fill="#aab" fontFamily="sans-serif">a+b = {+(a+safeB).toFixed(1)}</text>
            <text x={rx-10} y={ry+rh/2} textAnchor="end" fontSize="11" fill="#aab" fontFamily="sans-serif">a−b={+(a-safeB).toFixed(1)}</text>
          </>;
        })()}
      </svg>
    </div>
  );
};
export default DiffSquares;
