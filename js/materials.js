"use strict";
// 在公开 GitHub 仓库内，直接读取 materials 文件夹中的 PDF 文件列表。
// 注意：本地 file:// 网页不能枚举本地文件夹；请从 GitHub Pages 访问资料库。
const OWNER = 'WXF-hub';
const REPOSITORY = 'GravityStudio';
const DIRECTORY = 'materials';
const API_URL = `https://api.github.com/repos/${OWNER}/${REPOSITORY}/contents/${DIRECTORY}?ref=main`;
let materials = [];
let currentFilter = '全部';
const list = document.getElementById('materialList');
const counter = document.getElementById('materialsCount');
const filters = document.querySelector('.filters');
function classify(name) {
  const type = /练习|习题|试卷|测试|作业|测验|卷/.test(name) ? '课堂练习' : '学习资料';
  let category = '其他';
  if (/透镜|光学|反射|折射|色散|光线|光的/.test(name)) category = '光学';
  else if (/回声|声音|声学|声速|超声|响度|音调/.test(name)) category = '声学';
  else if (/力学|压强|浮力|摩擦|机械|运动|速度|功率|杠杆/.test(name)) category = '力学';
  else if (/电学|电路|电流|电压|电阻|欧姆/.test(name)) category = '电学';
  else if (/热学|温度|熔化|沸腾|比热|物态/.test(name)) category = '热学';
  return { category, type };
}
function buildFilters() {
  const options = ['全部', ...new Set(materials.map(x=>x.category)), '课堂练习'];
  filters.replaceChildren();
  for (const name of options) {
    const b = document.createElement('button');
    b.type='button'; b.dataset.filter=name;
    b.textContent=name==='全部'?'全部资料':name;
    b.classList.toggle('active',currentFilter===name);
    b.addEventListener('click',()=>{
      currentFilter=name;buildFilters();renderMaterials();
    });
    filters.append(b);
  }
}
function renderMaterials() {
  const q=document.getElementById('materialSearch').value.trim().toLowerCase();
  const visible=materials.filter(x=>(currentFilter==='全部'||x.category===currentFilter||x.type===currentFilter)&&[x.name,x.category,x.type].join(' ').toLowerCase().includes(q));
  counter.textContent=visible.length+' 份资料';
  list.replaceChildren();
  if (!visible.length) {
    const empty=document.createElement('div');empty.className='empty';
    empty.textContent=materials.length?'没有找到匹配的 PDF，请换个关键词。':'materials 文件夹里还没有 PDF。';
    list.append(empty);return;
  }
  for (const item of visible) {
    const row=document.createElement('article');row.className='file-card';
    const ico=document.createElement('div');ico.className='file-icon';ico.textContent='PDF';
    const content=document.createElement('div');content.className='file-content';
    const title=document.createElement('h3');title.textContent=item.name;
    const meta=document.createElement('p');meta.textContent=item.category+' · '+item.type;
    content.append(title,meta);
    const link=document.createElement('a');link.className='soft-btn';
    link.href=item.url;link.download=item.filename;link.textContent='下载 ↓';
    link.setAttribute('aria-label','下载 '+item.name);
    row.append(ico,content,link);list.append(row);
  }
}
function showLoadError(message) {
  counter.textContent='读取失败';list.replaceChildren();
  const el=document.createElement('div');el.className='empty';
  el.textContent=message;list.append(el);
}
async function loadMaterials() {
  counter.textContent='正在读取…';
  try {
    const response=await fetch(API_URL,{headers:{'Accept':'application/vnd.github+json'},cache:'no-store'});
    if(!response.ok) throw new Error('HTTP '+response.status);
    const files=await response.json();
    if(!Array.isArray(files)) throw new Error('目录返回数据异常');
    materials=files.filter(x=>x.type==='file'&&/\.pdf$/i.test(x.name)).map(file=>{
      const name=file.name.replace(/\.pdf$/i,'');
      return {name,filename:file.name,url:`${DIRECTORY}/${encodeURIComponent(file.name)}`,...classify(name)};
    }).sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));
    buildFilters();renderMaterials();
  } catch(err) {
    console.error('资料列表读取失败：',err);
    showLoadError('暂时无法读取 PDF 列表。请检查网络、GitHub 仓库是否公开，以及 materials 文件夹是否存在。若通过 Finder 直接打开 index.html，请改用已发布的 GitHub Pages 网站。');
  }
}
document.getElementById('materialSearch').addEventListener('input',renderMaterials);
loadMaterials();
