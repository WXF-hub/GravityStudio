"use strict";
// 首屏开场动画只在首页播放，实验文件独立运行。
const intro = document.getElementById('intro');
const introSkip = document.getElementById('introSkip');
let introTimer;
function closeIntro(){
  clearTimeout(introTimer);
  intro.classList.add('is-leaving');
  intro.setAttribute('aria-hidden','true');
  introSkip.blur();
  window.setTimeout(()=>intro.classList.add('hidden'),650);
}
function playIntro(){
  clearTimeout(introTimer);
  intro.classList.remove('hidden','is-leaving');
  intro.removeAttribute('aria-hidden');
  const stage=intro.querySelector('.intro-center');
  const avatar=intro.querySelector('.intro-avatar');
  stage.style.animation='none';avatar.style.animation='none';
  void stage.offsetWidth;stage.style.animation='';avatar.style.animation='';
  introTimer=window.setTimeout(closeIntro,3500);
}
introSkip.addEventListener('click',closeIntro);
document.getElementById('replayIntro').addEventListener('click',playIntro);
playIntro();
