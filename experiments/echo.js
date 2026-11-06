"use strict";
// 匀速汽艇驶向山崖，声音先到山崖再反射返回。
// 关键等式：路程(汽艇) + 路程(声音去程+回程) = 2×初始距离。
// 所有时间/路程由同一物理模型产生，不用视觉修正来凑最终数值。
const el = id => document.getElementById(id);
const BOAT_START = 112;
const CLIFF = 773;
const SCREEN_WIDTH = CLIFF - BOAT_START;
const SPEED_MULTIPLIER = 1.4;
let elapsed = 0;
let playing = false;
let raf = 0;
let previousTimestamp = null;
const format = number => number.toFixed(1) + ' m';

function parameters() {
  const v1 = Number(el('boatSpeed').value);
  const v2 = Number(el('soundSpeed').value);
  const t = Number(el('echoTime').value);
  const initialDistance = (v1 + v2) * t / 2;
  return {v1, v2, t, initialDistance,
          boatTotal: v1 * t, soundTotal: v2 * t,
          hitTime: initialDistance / v2};
}
function xAtDistance(d, p) {return BOAT_START + SCREEN_WIDTH * (d / p.initialDistance);}
function setLine(id, x1, x2) {
  el(id).setAttribute('x1', x1);
  el(id).setAttribute('x2', x2);
}
function render() {
  const p = parameters();
  const now = Math.min(elapsed, p.t);
  const boatDistance = p.v1 * now;
  const soundDistance = p.v2 * now;
  const boatX = xAtDistance(boatDistance,p);
  const outgoingDistance = Math.min(soundDistance, p.initialDistance);
  const returningDistance = Math.max(0, soundDistance - p.initialDistance);
  const outgoingEndX = xAtDistance(outgoingDistance,p);
  const returningEndX = xAtDistance(p.initialDistance - returningDistance,p);
  const returning = now >= p.hitTime;
  const soundX = returning ? returningEndX : outgoingEndX;

  // 空间路径不擦除：去程、回程和船的路程各自持续增长。
  setLine('outgoingTrail',BOAT_START,outgoingEndX);
  setLine('returnTrail',CLIFF,returning ? returningEndX : CLIFF);
  setLine('boatTrail',BOAT_START,boatX);
  el('boat').setAttribute('transform',`translate(${boatX.toFixed(3)},0)`);
  el('soundDot').setAttribute('cx',soundX.toFixed(3));
  el('soundDot').setAttribute('cy',returning ? '133' : '105');
  el('soundDot').setAttribute('fill',returning ? '#4b9dbb' : '#f37021');

  // 下方等长刻度条：绿色 s1 + 橙色 s2 串接，时间 t 时恰好是 2s。
  const pxPerM = SCREEN_WIDTH / (2*p.initialDistance);
  const boatBarEnd = BOAT_START + boatDistance * pxPerM;
  const soundBarEnd = boatBarEnd + soundDistance * pxPerM;
  el('boatBar').setAttribute('width',Math.max(0,boatBarEnd-BOAT_START).toFixed(3));
  el('soundBar').setAttribute('x',boatBarEnd.toFixed(3));
  el('soundBar').setAttribute('width',Math.max(0,soundBarEnd-boatBarEnd).toFixed(3));
  el('boatDistanceNow').textContent = format(boatDistance);
  el('soundDistanceNow').textContent = format(soundDistance);
  el('sumNow').textContent = format(boatDistance + soundDistance);
  el('doubleInitial').textContent = format(2*p.initialDistance);
  el('elapsedTime').textContent = now.toFixed(2)+' s';

  let stage = '准备发出喊声';
  let message = '调整参数，然后点击“发出喊声”。';
  if (now >= p.t - 1e-8) {
    stage = '回声已追上汽艇';
    message = `验证成功：${format(boatDistance)} + ${format(soundDistance)} = ${format(2*p.initialDistance)} = 2s。`;
  } else if (now >= p.hitTime) {
    stage = '声音已反射，正在返回';
    message = '橙线保留去程，蓝线正在累加回程；绿线保留汽艇路程。';
  } else if (now > 0) {
    stage = '声音前往山崖，汽艇同时向前';
    message = '观察橙色声路与绿色船路逐步增长。';
  }
  el('stageText').textContent=stage;
  el('echoStatus').textContent=message;
}
function updateParameters() {
  const p = parameters();
  el('boatSpeedLabel').textContent=p.v1+' m/s';
  el('soundSpeedLabel').textContent=p.v2+' m/s';
  el('echoTimeLabel').textContent=p.t+' s';
  el('boatTotal').textContent=format(p.boatTotal);
  el('soundTotal').textContent=format(p.soundTotal);
  el('initialDistance').textContent=format(p.initialDistance);
  el('hitTime').textContent=p.hitTime.toFixed(2)+' s';
}
function stop() {
  playing = false;
  previousTimestamp = null;
  cancelAnimationFrame(raf);
  raf=0;
}
function frame(timestamp) {
  if(!playing)return;
  if(previousTimestamp!==null) elapsed+=Math.min(0.08,(timestamp-previousTimestamp)/1000)*SPEED_MULTIPLIER;
  previousTimestamp=timestamp;
  const p=parameters();
  if(elapsed>=p.t){elapsed=p.t;stop();render();return;}
  render();
  raf=requestAnimationFrame(frame);
}
function reset(restoreDefaults) {
  stop();
  if(restoreDefaults){
    el('boatSpeed').value=10;
    el('soundSpeed').value=340;
    el('echoTime').value=4;
  }
  elapsed=0;
  updateParameters();
  render();
}
el('echoPlay').addEventListener('click',()=>{
  if(playing)return;
  const p=parameters();
  if(elapsed>=p.t)elapsed=0;
  playing=true;
  previousTimestamp=null;
  raf=requestAnimationFrame(frame);
});
el('echoPause').addEventListener('click',()=>{
  if(!playing)return;
  stop();
  el('echoStatus').textContent='实验已暂停，继续后累计路径不会消失。';
});
el('echoReset').addEventListener('click',()=>reset(true));
['boatSpeed','soundSpeed','echoTime'].forEach(id=>el(id).addEventListener('input',()=>reset(false)));
reset(false);
