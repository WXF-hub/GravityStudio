"use strict";
// 万有引力事务所：材料仅以 PDF 文件名展示，不使用分类。
// GitHub Pages 公开站点会从公开仓库的 materials/ 目录自动发现文件。
const OWNER = 'WXF-hub';
const REPOSITORY = 'GravityStudio';
const DIRECTORY = 'materials';
const API_URL = `https://api.github.com/repos/${OWNER}/${REPOSITORY}/contents/${DIRECTORY}?ref=main`;

const list = document.getElementById('materialList');
const counter = document.getElementById('materialsCount');
const search = document.getElementById('materialSearch');
const dialog = document.getElementById('pdfModal');
const frame = document.getElementById('pdfFrame');
const title = document.getElementById('pdfModalTitle');
const saveLink = document.getElementById('pdfSave');
const message = document.getElementById('pdfMessage');
const closeButton = document.getElementById('pdfClose');
let materials = [];
let activeMaterial = null;
let previousFocus = null;

function fileUrl(fileName) {
  // 在 GitHub Pages 项目路径 /GravityStudio/ 下也能正确获取绝对分享地址。
  return new URL(`${DIRECTORY}/${encodeURIComponent(fileName)}`, document.baseURI).href;
}

function showMessage(text) {
  message.textContent = text;
}

function openPreview(item) {
  activeMaterial = item;
  previousFocus = document.activeElement;
  title.textContent = item.name;
  saveLink.href = item.url;
  saveLink.download = item.filename;
  showMessage('');
  dialog.hidden = false;
  dialog.setAttribute('aria-hidden', 'false');
  document.body.classList.add('pdf-modal-open');
  // 使用片段 #toolbar=1 允许阅读器使用内置缩放和打印/下载工具。
  frame.src = `${item.url}#toolbar=1&navpanes=0`;
  closeButton.focus();
}

function closePreview() {
  if (dialog.hidden) return;
  dialog.hidden = true;
  dialog.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('pdf-modal-open');
  frame.removeAttribute('src');
  activeMaterial = null;
  showMessage('');
  if (previousFocus && previousFocus.isConnected) previousFocus.focus();
}

function renderMaterials() {
  const keyword = search.value.trim().toLocaleLowerCase('zh-CN');
  const visible = materials.filter(item => item.name.toLocaleLowerCase('zh-CN').includes(keyword));
  counter.textContent = `${visible.length} 份资料`;
  list.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = materials.length ? '没有找到匹配的 PDF，请换个关键词。' : 'materials 文件夹里还没有 PDF。';
    list.append(empty);
    return;
  }
  for (const item of visible) {
    const row = document.createElement('article');
    row.className = 'file-card';
    const icon = document.createElement('div');
    icon.className = 'file-icon';
    icon.textContent = 'PDF';
    const content = document.createElement('div');
    content.className = 'file-content';
    const name = document.createElement('h3');
    name.textContent = item.name;
    content.append(name);
    const actions = document.createElement('div');
    actions.className = 'file-actions';
    const preview = document.createElement('button');
    preview.className = 'primary';
    preview.type = 'button';
    preview.textContent = '全文浏览';
    preview.setAttribute('aria-label', `全文浏览 ${item.name}`);
    preview.addEventListener('click', () => openPreview(item));
    const download = document.createElement('a');
    download.className = 'soft-btn';
    download.href = item.url;
    download.download = item.filename;
    download.textContent = '下载 ↓';
    download.setAttribute('aria-label', `下载 ${item.name}`);
    actions.append(preview, download);
    row.append(icon, content, actions);
    list.append(row);
  }
}

function showLoadError() {
  counter.textContent = '读取失败';
  list.replaceChildren();
  const el = document.createElement('div');
  el.className = 'empty';
  el.textContent = '资料列表暂时无法读取。请检查网络、公开仓库地址和 GitHub API 访问限额。';
  list.append(el);
}

async function loadMaterials() {
  counter.textContent = '正在读取…';
  try {
    const response = await fetch(API_URL, {
      headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store'
    });
    if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`);
    const files = await response.json();
    if (!Array.isArray(files)) throw new Error('目录返回数据异常');
    materials = files
      .filter(file => file.type === 'file' && /\.pdf$/i.test(file.name))
      .map(file => ({
        name: file.name.replace(/\.pdf$/i, ''),
        filename: file.name,
        url: fileUrl(file.name)
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    renderMaterials();
  } catch (err) {
    console.error('读取资料失败', err);
    showLoadError();
  }
}

closeButton.addEventListener('click', closePreview);
dialog.addEventListener('click', event => {
  if (event.target === dialog) closePreview();
});
document.addEventListener('keydown', event => {
  if (dialog.hidden) return;
  if (event.key === 'Escape') { closePreview(); return; }
  if (event.key === 'Tab') {
    const controls = Array.from(dialog.querySelectorAll('button, a[href]'))
      .filter(node => node.getClientRects().length > 0);
    if (!controls.length) return;
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
});
search.addEventListener('input', renderMaterials);
loadMaterials();
