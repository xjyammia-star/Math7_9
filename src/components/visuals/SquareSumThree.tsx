import React, { useState } from 'react';
import { Language } from '../../types';

const SquareSumThree: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [c, setC] = useState(2);
  const zh = lang === 'zh';

  const total = a + b + c;
  const result = +(total * total).toFixed(2);
  const a2 = a*a, b2 = b*b, c2 = c*c;
  const ab = a*b, bc = b*c, ac = a*c;

  const W = 300, H = 280;
  const sc = (Math.min(W, H) * 0.78) / total;
  const A = a*sc, B = b*sc, C = c*sc;
  const ox = (W - A - B - C) / 2;
  const oy = (H - A - B - C) / 2;

  type Region = { x:number; y:number; w:number; h:number; fill:string; label:string };
  const regions: Region[] = [
    { x:ox,     y:oy,     w:A, h:A, fill:'rgba(200,100,140,0.75)', label:'a²' },
    { x:ox+A,   y:oy,     w:B, h:A, fill:'rgba(160,120,220,0.7)',  label:'ab' },
    { x:ox+A+B, y:oy,     w:C, h:A, fill:'rgba(100,160,220,0.7)',  label:'ac' },
    { x:ox,     y:oy+A,   w:A, h:B, fill:'rgba(160,120,220,0.7)',  label:'ab' },
    { x:ox+A,   y:oy+A,   w:B, h:B, fill:'rgba(80,180,120,0.75)', label:'b²' },
    { x:ox+A+B, y:oy+A,   w:C, h:B, fill:'rgba(220,160,80,0.7)',  label:'bc' },
    { x:ox,     y:oy+A+B, w:A, h:C, fill:'rgba(100,160,220,0.7)',  label:'ac' },
    { x:ox+A,   y:oy+A+B, w:B, h:C, fill:'rgba(220,160,80,0.7)',  label:'bc' },
    { x:ox+A+B, y:oy+A+B, w:C, h:C, fill:'rgba(220,100,100,0.75)', label:'c²' },
  ];

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>

      {/* Sliders */}
      {([['a', a, setA, 1, 8], ['b', b, setB, 1, 8], ['c', c, setC, 1, 8]] as any[]).map(([lbl,val,setter,mn,mx]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
          <span style={{ width:12, color:'#aaa', fontSize:13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={0.5} value={val}
            onChange={e=>setter(parseFloat(e.target.value))}
            style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:32, textAlign:'right', fontWeight:600, fontSize:13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}

      {/* Formula lines — each on its own line, no overflow */}
      <div style={{ fontSize:12, color:'#bbb', margin:'8px 0 10px', lineHeight:1.9, wordBreak:'break-word' }}>
        <div>(a+b+c)² = a²+b²+c²+2ab+2bc+2ac</div>
        <div style={{ fontSize:11 }}>
          = {a2}+{b2}+{c2}+2×{ab}+2×{bc}+2×{ac}
        </div>
        <div>
          = <strong style={{ color:'#7db3ff' }}>{result}</strong>
        </div>
      </div>

      {/* SVG grid */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block' }}>
        {/* Outer dashed border */}
        <rect x={ox} y={oy} width={A+B+C} height={A+B+C}
          fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4 2" />

        {regions.map((r, i) => (
          <g key={i}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h}
              fill={r.fill} stroke="#333" strokeWidth="0.5" />
            {r.w > 18 && r.h > 14 && (
              <text x={r.x+r.w/2} y={r.y+r.h/2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="11" fill="#fff" fontFamily="sans-serif" fontWeight="bold">
                {r.label}
              </text>
            )}
          </g>
        ))}

        {/* Column labels */}
        <text x={ox+A/2}     y={oy-10} textAnchor="middle" fontSize="12" fill="#aab" fontFamily="sans-serif">a</text>
        <text x={ox+A+B/2}   y={oy-10} textAnchor="middle" fontSize="12" fill="#aab" fontFamily="sans-serif">b</text>
        <text x={ox+A+B+C/2} y={oy-10} textAnchor="middle" fontSize="12" fill="#aab" fontFamily="sans-serif">c</text>

        {/* Row labels */}
        <text x={ox-12} y={oy+A/2}     textAnchor="middle" fontSize="12" fill="#aab" fontFamily="sans-serif">a</text>
        <text x={ox-12} y={oy+A+B/2}   textAnchor="middle" fontSize="12" fill="#aab" fontFamily="sans-serif">b</text>
        <text x={ox-12} y={oy+A+B+C/2} textAnchor="middle" fontSize="12" fill="#aab" fontFamily="sans-serif">c</text>
      </svg>
    </div>
  );
};

export default SquareSumThree;
