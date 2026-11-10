"use strict";
// 基于斯涅尔定律的两种均匀透明介质界面模型；折射率为教学近似值。
const $ = id => document.getElementById(id);
const pairs = {
  'air-water': {first:'空气',second:'水',n1:1.00,n2:1.33,color:'#d9eefb'},
  'air-glass': {first:'空气',second:'玻璃',n1:1.00,n2:1.50,color:'#e6e8f8'},
  'water-air': {first:'水',second:'空气',n1:1.33,n2:1.00,color:'#fafbfc'},
  'glass-air': {first:'玻璃',second:'空气',n1:1.50,n2:1.00,color:'#fafbfc'}
};
const toRad = x => x*Math.PI/180;
const toDeg = x => x*180/Math.PI;
const OX = 500, OY = 245, LENGTH = 205;
const line = (x1,y1,x2,y2,c,w=4,dash='') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
function update() {
  const medium = pairs[$('mediumPair').value];
  const iDeg = Number($('incidenceSlider').value);
  const i = toRad(iDeg);
  const sinR = medium.n1/medium.n2 * Math.sin(i);
  const total = sinR > 1 + 1e-12;
  const critical = medium.n1 > medium.n2 ? toDeg(Math.asin(medium.n2/medium.n1)) : null;
  const r = total ? null : Math.asin(Math.min(1, Math.max(-1,sinR)));
  const fromX = OX-LENGTH*Math.sin(i);
  const fromY = OY-LENGTH*Math.cos(i);
  const reflectedX = OX+LENGTH*Math.sin(i);
  const reflectedY = OY-LENGTH*Math.cos(i);
  const rEndX = r === null ? 0 : OX+LENGTH*Math.sin(r);
  const rEndY = r === null ? 0 : OY+LENGTH*Math.cos(r);
  const topColor = medium.n1===1.00 ? '#f7f9fc' : (medium.first==='水'?'#d9eefb':'#e6e8f8');
  let s = `<defs><marker id="arrowOrange" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#f37021"/></marker>
    <marker id="arrowBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#4b9dbb"/></marker>
    <marker id="arrowGray" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#8e9aa7"/></marker></defs>
    <rect width="1000" height="245" fill="${topColor}"/>
    <rect y="245" width="1000" height="245" fill="${medium.color}"/>
    ${line(30,OY,970,OY,'#6c8492',2.5)}
    ${line(OX,18,OX,477,'#a0abb4',2,'8 7')}
    <text x="38" y="46" fill="#4f6472" font-size="24">${medium.first} · n₁ ≈ ${medium.n1.toFixed(2)}</text>
    <text x="38" y="452" fill="#4f6472" font-size="24">${medium.second} · n₂ ≈ ${medium.n2.toFixed(2)}</text>
    <text x="521" y="42" fill="#72808a" font-size="20">法线</text>
    <text x="758" y="232" fill="#72808a" font-size="19">介质分界面</text>
    ${line(fromX,fromY,OX,OY,'#f37021',4.5).replace('/>',' marker-end="url(#arrowOrange)"/>')}
    ${line(OX,OY,reflectedX,reflectedY,'#8e9aa7',3.5).replace('/>',' marker-end="url(#arrowGray)"/>')}
    <circle cx="${OX}" cy="${OY}" r="5" fill="#303030"/>
    <text x="${OX+10}" y="${OY-14}" fill="#303030" font-size="20">O</text>
    <text x="${OX-30}" y="${OY-85}" fill="#303030" font-size="20">i = ${iDeg}°</text>`;
  if (r !== null) {
    s += line(OX,OY,rEndX,rEndY,'#4b9dbb',4.5).replace('/>',' marker-end="url(#arrowBlue)"/>');
    s += `<text x="${OX+26}" y="${OY+87}" fill="#236a83" font-size="20">r = ${toDeg(r).toFixed(1)}°</text>`;
  } else {
    s += `<rect x="610" y="305" width="310" height="55" rx="12" fill="#fff2e8"/>
      <text x="630" y="340" font-size="21" fill="#b05218">全反射：没有折射光线</text>`;
  }
  $('refractionDiagram').innerHTML=s;
  $('incidenceLabel').textContent=`${iDeg}°`;
  $('iRead').textContent=`${iDeg}°`;
  $('rRead').textContent=total?'无折射光':`${toDeg(r).toFixed(1)}°`;
  $('indicesReadout').textContent=`${medium.first} n₁ ≈ ${medium.n1.toFixed(2)} · ${medium.second} n₂ ≈ ${medium.n2.toFixed(2)}` + (critical!==null?` · 临界角约 ${critical.toFixed(1)}°`:'');
  let state,desc;
  if (total) {
    state='全反射';
    desc=`入射角 ${iDeg}° 大于临界角 ${critical.toFixed(1)}°，传播光全部反射回第一种介质。`;
  } else if (iDeg===0) {
    state='垂直入射，方向不变';
    desc='光沿法线传播时，折射角为 0°。';
  } else if (medium.n1 < medium.n2) {
    state='向法线偏折';
    desc=`光从${medium.first}斜射入${medium.second}，折射角小于入射角。`;
  } else {
    state='偏离法线';
    desc=`光从${medium.first}斜射入${medium.second}，折射角大于入射角。`;
  }
  $('stateRead').textContent=state;
  $('refractionResult').textContent=state;
  $('refractionDesc').textContent=desc;
}
$('mediumPair').addEventListener('change',update);
$('incidenceSlider').addEventListener('input',update);
$('resetRefraction').addEventListener('click',()=>{
  $('mediumPair').value='air-water';
  $('incidenceSlider').value=45;
  update();
});
update();
