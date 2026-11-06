"use strict";
// 万有引力事务所：凸透镜成像。固定绘图比例，焦距、物距两个滑块互不联动。
// 约定：SVG 坐标 y 向下为正；实像 v>0、m<0，虚像 v<0、m>0。
const DEFAULT_FOCUS_CM = 20;
const PIXELS_PER_CM = 7;
const LENS_X = 500;
const AXIS_Y = 220;
const OBJECT_HEIGHT = 62;
const WIDTH = 1000;
const HEIGHT = 440;
const byId = id => document.getElementById(id);
const diagram = byId('lensDiagram');
const line = (x1, y1, x2, y2, color, w=3, dash='') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`;
function objectArrow(x, topY, color, caption) {
  return `<g>${line(x, AXIS_Y, x, topY, color, 4)}
    <path d="M${x-8} ${topY+12} L${x} ${topY} L${x+8} ${topY+12}" fill="none" stroke="${color}" stroke-width="4"/>
    <text x="${x-13}" y="${topY-15}" text-anchor="end" fill="${color}" font-size="16">${caption}</text></g>`;
}
function imageArrow(x, tipY, color, caption) {
  // 箭头顶点是两条光线交点 (x,tipY)，不留绘图偏移。
  const down = tipY > AXIS_Y;
  const wingY = tipY + (down ? -12 : 12);
  const labelY = down ? tipY+28 : tipY-16;
  return `<g>${line(x, AXIS_Y, x, tipY, color, 4)}
    <path d="M${x-8} ${wingY} L${x} ${tipY} L${x+8} ${wingY}" fill="none" stroke="${color}" stroke-width="4"/>
    <circle cx="${x}" cy="${tipY}" r="3.3" fill="${color}"/>
    <text x="${x+12}" y="${labelY}" fill="${color}" font-size="16">${caption}</text></g>`;
}
function drawLens() {
  const u = Number(byId('uSlider').value);
  const f = Number(byId('fSlider').value);
  const atFocus = u === f;
  const v = atFocus ? Infinity : f*u/(u-f);
  const m = atFocus ? Infinity : -v/u;
  const real = u > f;
  const focusDX = f*PIXELS_PER_CM;
  const objectX = LENS_X-u*PIXELS_PER_CM;
  const objectTopY = AXIS_Y-OBJECT_HEIGHT;
  const imageX = LENS_X+v*PIXELS_PER_CM;
  const imageTipY = AXIS_Y-m*OBJECT_HEIGHT;
  const imageVisible = Number.isFinite(v) && imageX>30 && imageX<WIDTH-45 && imageTipY>30 && imageTipY<HEIGHT-35;
  const farX = 1250;
  const orange = '#f37021';
  const blue = '#4b9dbb';
  const parallelSlope = OBJECT_HEIGHT/focusDX;
  const centerSlope = OBJECT_HEIGHT/(u*PIXELS_PER_CM);
  const orangeEndY = objectTopY + (farX-LENS_X)*parallelSlope;
  const blueEndY = AXIS_Y + (farX-LENS_X)*centerSlope;

  let s = `<defs><clipPath id="diagramClip"><rect x="20" y="15" width="960" height="407"/></clipPath></defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#fafbfc"/>
    ${line(24,AXIS_Y,976,AXIS_Y,'#c4cdd3',2,'8 6')}
    <path d="M500 130 Q486 220 500 310 Q514 220 500 130" fill="#bee6ee88" stroke="#5d9baa" stroke-width="3"/>
    ${line(LENS_X,115,LENS_X,325,'#8d9ca8',1.3,'5 6')}`;
  for (const sign of [-1,1]) {
    const fx = LENS_X+sign*focusDX;
    const twoFx = LENS_X+sign*2*focusDX;
    s += `<circle cx="${fx}" cy="${AXIS_Y}" r="4" fill="#67747c"/>
      <text x="${fx}" y="${AXIS_Y+25}" text-anchor="middle" fill="#687680" font-size="17">F</text>
      <circle cx="${twoFx}" cy="${AXIS_Y}" r="3.7" fill="#a8afb4"/>
      <text x="${twoFx}" y="${AXIS_Y+44}" text-anchor="middle" fill="#78838a" font-size="15">2F</text>`;
  }

  s += objectArrow(objectX,objectTopY,'#303030','物体');
  s += `<g clip-path="url(#diagramClip)">
    <!-- 橙线：物顶平行于主轴至透镜，然后通过像方焦点 (LENS_X+f*scale,AXIS_Y) -->
    ${line(objectX,objectTopY,LENS_X,objectTopY,orange,3.5)}`;
  if (real && Number.isFinite(v)) {
    // 明确把两条实像光线都连到理论交点，避免箭头和交点产生视觉错位。
    s += line(LENS_X,objectTopY,imageX,imageTipY,orange,3.5);
    s += line(imageX,imageTipY,farX,orangeEndY,orange,3.5);
  } else {
    s += line(LENS_X,objectTopY,farX,orangeEndY,orange,3.5);
  }
  s += `<!-- 蓝线：物顶 -> 光心 O -> 不改变方向 -->
    ${line(objectX,objectTopY,LENS_X,AXIS_Y,blue,3.2)}`;
  if (real && Number.isFinite(v)) {
    s += line(LENS_X,AXIS_Y,imageX,imageTipY,blue,3.2);
    s += line(imageX,imageTipY,farX,blueEndY,blue,3.2);
  } else {
    s += line(LENS_X,AXIS_Y,farX,blueEndY,blue,3.2);
  }
  if (!real && !atFocus) {
    // 虚像：两条出射光线向左的反向延长线相交于虚像顶端。
    s += line(LENS_X,objectTopY,imageX,imageTipY,'#9299a2',2,'7 6');
    s += line(LENS_X,AXIS_Y,imageX,imageTipY,'#9299a2',2,'7 6');
  }
  s += '</g>';
  if (imageVisible) {
    s += imageArrow(imageX,imageTipY,real?'#303030':'#3289a5',real?'倒立实像':'正立虚像');
  } else {
    s += `<rect x="648" y="22" rx="9" width="325" height="44" fill="#fff2e8"/>
      <text x="661" y="49" fill="#a44c15" font-size="15">${atFocus?'物体位于焦点：像在无穷远处':'像在绘图区之外，绘图比例保持不变'}</text>`;
  }
  s += `<circle cx="${LENS_X}" cy="${AXIS_Y}" r="4.5" fill="#303030"/>
    <text x="${LENS_X+9}" y="${AXIS_Y-12}" fill="#303030" font-size="16">O</text>
    <text x="35" y="43" fill="#6a7279" font-size="17">主光轴</text>
    <text x="518" y="117" fill="#4d8797" font-size="16">凸透镜</text>
    <text x="34" y="406" fill="#89919a" font-size="14">焦距 f = ${f} cm，2f = ${2*f} cm ｜ 固定绘图比例</text>`;
  diagram.innerHTML = s;

  byId('uRead').textContent = `${u} cm`;
  byId('vRead').textContent = atFocus ? '趋于无穷' : `${v.toFixed(1)} cm`;
  byId('mRead').textContent = atFocus ? '—' : m.toFixed(2);
  byId('uLabel').textContent = `${u} cm`;
  byId('fLabel').textContent = `${f} cm`;
  byId('focusReadout').innerHTML = `当前焦距 f = ${f} cm · 二倍焦距 2f = ${2*f} cm<br/>仅拖动物距时，F、2F 不会移动。`;
  let state,desc;
  if (atFocus) {
    state = '物体位于焦点，像位于无穷远';
    desc = '出射的两条光线平行，不能在有限距离的光屏上得到清晰实像。';
  } else if (u<f) {
    state = '正立、放大的虚像';
    desc = '像在透镜的物方，两条出射光线反向延长后相交，不能用光屏承接。';
  } else if (u>2*f) {
    state = '倒立、缩小的实像';
    desc = '物距大于 2f，像处于透镜另一侧 f 与 2f 之间。';
  } else if (u===2*f) {
    state = '倒立、等大的实像';
    desc = '物体与实像分别位于透镜两侧的 2F 处。';
  } else {
    state = '倒立、放大的实像';
    desc = '物距在 f 与 2f 之间，像处于透镜另一侧 2f 之外。';
  }
  byId('lensResult').textContent = state;
  byId('lensDesc').textContent = desc + (atFocus || imageVisible ? '' : ' 实际成像点超出当前绘图区。');
}
byId('uSlider').addEventListener('input',drawLens);
byId('fSlider').addEventListener('input',drawLens);
byId('resetLens').addEventListener('click',()=>{
  byId('uSlider').value=50;
  byId('fSlider').value=DEFAULT_FOCUS_CM;
  drawLens();
});
drawLens();
