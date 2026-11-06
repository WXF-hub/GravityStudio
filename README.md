# 万有引力事务所 · 回声累计路程版

在上一版「全文浏览与下载版」基础上增加第三个独立实验：汽艇与回声。

## 页面
- `index.html`：保留首页文案、Logo、片头及 PDF 全文浏览/下载，增加回声实验入口
- `experiments/echo.html`：新的回声实验页面
- `experiments/echo.js`：动画与物理计算，所有走过的路程持续保留
- `experiments/echo.css`：回声页面样式
- `css/site.css`：增加三实验卡片布局

## 核心演示
船速 v1、声速 v2、收到回声时长 t，初始距离 s=(v1+v2)t/2。

- 绿色线：船从起点到当前位置的累计路程 s1。
- 橙色线：声音从起点到山崖的去程累计，抵达山崖后仍保留。
- 蓝色线：声音从山崖返回的回程累计，与橙色共同组成声音总路程 s2。
- 底部累计路程条：绿色 s1 接橙色 s2，声音到达汽艇时恰好填满 2s。

暂停与继续不会擦除已走过的路径；改变参数会重置本次演示。

## GitHub Pages 更新
替换根目录 `index.html` 和 `css/site.css`；新增 `experiments/echo.html`、`experiments/echo.js`、`experiments/echo.css`。其余文件保持不变。

资料库仍通过 GitHub 公共仓库 API 自动列出 `materials/` 下的 PDF，只提供全文浏览和下载，不包含微信分享。
