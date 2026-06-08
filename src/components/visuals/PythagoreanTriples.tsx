import React, { useState } from 'react';
import { Language } from '../../types';

const TRIPLES = [
  [3,4,5],[5,12,13],[8,15,17],[7,24,25],[6,8,10],[9,12,15],[20,21,29]
];

const PythagoreanTriples: React.FC<{ lang: Language }> = ({ lang }) => {
  const [idx, setIdx] = useState(0);
  const zh = lang === 'zh';
  const [a, b, c] = TRIPLES[idx];
  const check = a*a + b*b;

  const W = 280, H = 240, PAD = 36;
  const maxSide = Math.max(a+b, b+b, a+a)*1.1;
  const sc = Math.min((W*0.58)/maxSide,(H*0.58)/maxSide);
  const A = a*sc, B = b*sc;
  const ox = W/2 - A/2 + B*0.1;
  const oy = H/2 + A/2 + B*0.1;
  const Ax = ox+A, Ay = oy, Bx = ox, By = oy-B;
  const dx = Bx-Ax, dy = By-Ay;
  const len = Math.sqrt(dx*dx+dy*dy);
  const nx = -dy/len*(c*sc), ny = dx/len*(c*sc);
  const sqA = [[ox,oy],[Ax,Ay],[Ax,Ay+A],[ox,oy+A]];
  const sqB = [[ox,oy],[ox,By],[ox-B,By],[ox-B,oy]];
  const sqC = [[Ax,Ay],[Bx,By],[Bx+nx,By+ny],[Ax+nx,Ay+ny]];

  function sq(pts:number[][], fill:string, lbl:string) {
    const d = pts.map((p,i)=>`${i===0?'M':'L'}${p[0]},${p[1]}`).join('')+'Z';
    const cx2 = pts.reduce((s,p)=>s+p[0],0)/4;
    const cy2 = pts.reduce((s,p)=>s+p[1],0)/4;
    const w = Math.sqrt((pts[1][0]-pts[0][0])**2+(pts[1][1]-pts[0][1])**2);
    return <g key={lbl}><path d={d} fill={fill} stroke="#555" strokeWidth="1"/>
      {w>22&&<text x={cx2} y={cy2} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#fff" fontFamily="sans-serif" fontWeight="bold">{lbl}</text>}
    </g>;
  }

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      <div style={{ marginBottom:10 }}>
        <div style={{ fontSize:12, color:'#aaa', marginBottom:6 }}>{zh?'选择勾股数：':'Select a triple:'}</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {TRIPLES.map(([a,b,c],i)=>(
            <button key={i} onClick={()=>setIdx(i)}
              style={{ padding:'3px 10px', borderRadius:16, border:'1px solid', fontSize:11, cursor:'pointer',
                borderColor:idx===i?'#5b8dd9':'#445', background:idx===i?'#2a4a7f':'transparent',
                color:idx===i?'#fff':'#99a' }}>
              ({a},{b},{c})
            </button>
          ))}
        </div>
      </div>
      <div style={{ fontSize:12, color:'#bbb', margin:'4px 0 8px', lineHeight:1.8 }}>
        <div><strong style={{ color:'#ffd' }}>({a}, {b}, {c})</strong> — {zh?'验证':'Check'}: {a}²+{b}² = {a*a}+{b*b} = <strong style={{ color:'#10b981' }}>{check}</strong> = {c}² ✓</div>
        <div style={{ fontSize:11 }}>{zh?`倍数: (${a*2},${b*2},${c*2}) 也是勾股数`:`Multiples: (${a*2},${b*2},${c*2}) also work`}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block' }}>
        {sq(sqA,'rgba(220,100,100,0.65)',`a²=${a*a}`)}
        {sq(sqB,'rgba(80,160,220,0.65)',`b²=${b*b}`)}
        {sq(sqC,'rgba(80,200,130,0.65)',`c²=${c*c}`)}
        <polygon points={`${ox},${oy} ${Ax},${Ay} ${Bx},${By}`} fill="rgba(240,200,80,0.55)" stroke="#cc8" strokeWidth="1.5" />
        <polyline points={`${ox+8},${oy} ${ox+8},${oy-8} ${ox},${oy-8}`} fill="none" stroke="#ffd" strokeWidth="1" />
        <text x={(ox+Ax)/2} y={oy+15} textAnchor="middle" fontSize="11" fill="#ffd" fontFamily="sans-serif">a={a}</text>
        <text x={ox-18} y={(oy+By)/2} textAnchor="middle" fontSize="11" fill="#8df" fontFamily="sans-serif">b={b}</text>
        <text x={(Ax+Bx)/2+nx/Math.hypot(nx,ny)*14} y={(Ay+By)/2+ny/Math.hypot(nx,ny)*14}
          textAnchor="middle" fontSize="11" fill="#8fb" fontFamily="sans-serif">c={c}</text>
      </svg>
    </div>
  );
};
export default PythagoreanTriples;
