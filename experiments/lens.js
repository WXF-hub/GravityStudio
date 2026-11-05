"use strict";
// 焦距、物距独立滑块；绘图比例始终不变，F 和 2F 只响应焦距变化。
// 薄透镜：1/f=1/u+1/v；横向放大率 m=-v/u。
const DEFAULT_FOCUS_CM = 20;
const PIXELS_PER_CM = 7;
const LENS_X = 500;
const AXIS_Y = 220;
const OBJECT_HEIGHT = 62;
const WIDTH = 1000;
const HEIGHT = 440;
const byId = id => document.getElementById(id);
const svg = byId('lensDiagram');
const fmt = value => Number.isFinite(value) ? value.toFixed(1) : '∞';
const line = (x1,y1,x2,y2,color,width=3,dash='') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`;
function arrow(x,tipY,baseY,color,label) {
  // 保证出画布的像不会被误画在其他位置。
  if (x < 28 || x > WIDTH-28 || tipY < 26 || tipY > HEIGHT-28) return '';
  const down = tipY>baseY;
  const arrowOffset = down ? -12 : 12;
  const labelY = down ? tipY+26 : tipY-13;
  return `<g>${line(x,baseY,x,tipY,color,4)}
    <path d="M${x-8} ${tipY+arrowOffset} L${x} ${tipY} L${x+8} ${tipY+arrowOffset}" fill="none" stroke="${color}" stroke-width="4"/>
    <text x="${x+12}" y="${labelY}" fill="${color}" font-size="16">${label}</text></g>`;
}
function drawLens() {
  const u=Number(byId('uSlider').value);
  const f=Number(byId('fSlider').value);
  const atFocus=u===f;
  const v=atFocus ? Infinity : f*u/(u-f);
  const m=atFocus ? Infinity : -v/u;
  const isReal=u>f;
  const focusDX=f*PIXELS_PER_CM;
  const objectX=LENS_X-u*PIXELS_PER_CM;
  const objectTipY=AXIS_Y-OBJECT_HEIGHT;
  const imageX=LENS_X+v*PIXELS_PER_CM;
  // SVG 坐标 y 向下为正；m<0 的实像必须位于主光轴下方。
  const imageTipY=AXIS_Y-m*OBJECT_HEIGHT;
  const imageOnScreen=Number.isFinite(v) && imageX>32 && imageX<WIDTH-44 && imageTipY>30 && imageTipY<HEIGHT-30;

  let s=`<defs><clipPath id="diagramClip"><rect x="20" y="15" width="960" height="406"/></clipPath></defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#fafbfc"/>
    ${line(24,AXIS_Y,976,AXIS_Y,'#c4cdd3',2,'8 6')}
    <path d="M500 120 Q480 220 500 320 Q520 220 500 120" fill="#bee6ee88" stroke="#5d9baa" stroke-width="3"/>
    ${line(LENS_X,105,LENS_X,338,'#8d9ca8',1.3,'5 6')}`;
  for (const sign of [-1,1]) {
    const fx=LENS_X+sign*focusDX;
    const twoFX=LENS_X+sign*2*focusDX;
    s+=`<circle cx="${fx}" cy="${AXIS_Y}" r="4" fill="#67747c"/>
      <text x="${fx-6}" y="${AXIS_Y+25}" fill="#687680" font-size="17">F</text>
      <circle cx="${twoFX}" cy="${AXIS_Y}" r="3.7" fill="#a8afb4"/>
      <text x="${twoFX-12}" y="${AXIS_Y+44}" fill="#78838a" font-size="15">2F</text>`;
  }
  s+=arrow(objectX,objectTipY,AXIS_Y,'#f37021','物体');

  // 三条常见作图规则中的两条：平行主轴后经右焦点；过光心不偏折。
  // 两条线都是从物顶端出发，延伸方向独立于像距变化。
  const farX=1200;
  const parallelSlope=OBJECT_HEIGHT/focusDX;
  const centerSlope=OBJECT_HEIGHT/(u*PIXELS_PER_CM);
  s+=`<g clip-path="url(#diagramClip)">
    ${line(objectX,objectTipY,LENS_X,objectTipY,'#f37021',3.5)}
    ${line(objectX,objectTipY,farX,objectTipY+(farX-LENS_X)*centerSlope,'#4b9dbb',3.1)}
    ${line(LENS_X,objectTipY,farX,objectTipY+(farX-LENS_X)*parallelSlope,'#f37021',3.5)}
  </g>`;
  if (!atFocus && !isReal) {
    // 虚像由折射光线向入射侧反向延长相交得到。
    s+=`<g clip-path="url(#diagramClip)">
      ${line(LENS_X,objectTipY,imageX,imageTipY,'#8a939d',2,'7 6')}
      ${line(LENS_X,AXIS_Y,imageX,imageTipY,'#8a939d',2,'7 6')}
    </g>`;
  }
  if (!atFocus && imageOnScreen) s+=arrow(imageX,imageTipY,AXIS_Y,isReal?'#303030':'#439caf',isReal?'倒立实像':'正立虚像');
  if (atFocus || !imageOnScreen) {
    s+=`<rect x="655" y="25" rx="9" width="305" height="40" fill="#fff2e8"/>
      <text x="670" y="50" fill="#a44c15" font-size="15">${atFocus?'物体在焦点：像位于无穷远':'实际像位于绘图区外（未改变比例）'}</text>`;
  }
  s+=`<text x="35" y="42" fill="#6a7279" font-size="17">主光轴</text>
    <text x="518" y="112" fill="#4d8797" font-size="16">凸透镜</text>
    <text x="34" y="404" fill="#89919a" font-size="14">当前焦距 f = ${f} cm，2f = ${2*f} cm ｜ 绘图比例固定</text>`;
  svg.innerHTML=s;

  byId('uRead').textContent=u+' cm';
  byId('vRead').textContent=atFocus?'趋于无穷':fmt(v)+' cm';
  byId('mRead').textContent=atFocus?'—':m.toFixed(2);
  byId('uLabel').textContent=u+' cm';
  byId('fLabel').textContent=f+' cm';
  byId('focusReadout').innerHTML=`当前焦距 f = ${f} cm · 二倍焦距 2f = ${2*f} cm<br/>仅拖动物距时，F、2F 不会移动。`;
  let state,desc;
  if(atFocus){
    state='物体位于焦点，像位于无穷远';
    desc='出射的两条主光线互相平行，不能在有限距离的光屏上成清晰实像。';
  }else if(u<f){
    state='正立、放大的虚像';
    desc='像在物体同侧，由折射光线的反向延长线相交形成，不能用光屏承接。';
  }else if(u>2*f){
    state='倒立、缩小的实像';
    desc='物体位于 2F 以外，像位于另一侧 F 和 2F 之间。';
  }else if(u===2*f){
    state='倒立、等大的实像';
    desc='物体与像分别位于透镜两侧的 2F 处。';
  }else{
    state='倒立、放大的实像';
    desc='物体位于 F 与 2F 之间，像位于另一侧 2F 以外。';
  }
  byId('lensResult').textContent=state;
  byId('lensDesc').textContent=desc+(atFocus||imageOnScreen?'':' 由于采用固定比例，当前像可能超出绘图区域。');
}
byId('uSlider').addEventListener('input',drawLens);
byId('fSlider').addEventListener('input',drawLens);
byId('resetLens').addEventListener('click',()=>{
  byId('uSlider').value=50;
  byId('fSlider').value=DEFAULT_FOCUS_CM;
  drawLens();
});
drawLens();
