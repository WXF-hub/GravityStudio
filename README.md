# 万有引力事务所 · 焦距与物距双滑块实验及自动资料库

## 文件结构

- `index.html`：首页和资料入口。
- `css/site.css`：统一视觉样式。
- `js/site.js`：开场动画。
- `js/materials.js`：**自动从公开 GitHub 仓库读取 PDF 列表**、搜索及分类。
- `experiments/lens.html`：凸透镜演示页面。
- `experiments/lens.js`：凸透镜成像光路计算与绘制。
- `assets/avatar.png`：头像。
- `materials/*.pdf`：学习资料。回声实验代码已删除；以前的回声 PDF 仍作为资料保留。

## 凸透镜

- 焦距滑块范围 **12～28 cm**，默认 **f=20 cm**。焦距决定 F、2F 的坐标；只改物距时焦距不变，因此 F、2F 不动。
- 透镜尺寸保持上一版较小的样式；物距滑块范围 12～60 cm。两个滑块互不联动，重置按钮恢复 f=20 cm、u=50 cm。
- 不再自动修改图像比例；极端物距下，像可能落在可视区域外，会显示提示，这属于固定比例绘图的正常表现。
- 物距大于焦距时倒立实像；小于焦距时正立虚像；等于焦距时像位于无穷远处。

## 新增 PDF：不再修改网页代码

1. 打开 GitHub 上的公开仓库 `WXF-hub/GravityStudio`。
2. 进入 **materials** 文件夹。
3. 选择 **Add file → Upload files**，上传一个或多个 PDF，**Commit changes**。
4. GitHub Pages 自动部署完成后，刷新网站的资料库区域。新的 PDF 将自动出现。

自动列表来自 GitHub REST API：
`https://api.github.com/repos/WXF-hub/GravityStudio/contents/materials?ref=main`

**前提与限制：**
- 仓库必须公开；GitHub API 需有网络访问权限，并有匿名访问频率限制。
- 仅自动列出 `materials/` 的**第一层 PDF 文件**，不递归读取子文件夹。
- 分类按 PDF **文件名**自动识别，如“凸透镜课堂练习.pdf”属于光学/课堂练习；未识别归入其他。
- 本地双击 `index.html` 时也会尝试读取**线上仓库**，不是本地文件。要立即看到新上传的文件，打开 GitHub Pages 并刷新浏览器。
- 上传文件后可先在 GitHub 仓库确认 PDF 文件已经出现在 `materials/` 中。
- 以后如果仓库用户名/仓库名变化，需相应修改 `js/materials.js` 顶部的 `OWNER`、`REPOSITORY` 常量（一次性配置）。
- GitHub Pages 是公开网站，不要上传学生隐私信息或保密资料。

## GitHub 更新注意

1. 把本压缩包**解压后的内容**上传到仓库根目录，不要上传 ZIP 文件本身。
2. 必须保留 `index.html`、`css/`、`js/`、`experiments/`、`assets/`、`materials/` 的目录结构。
3. **删除旧版 `experiments/echo.html` 和 `experiments/echo.js`**，以及任何不再需要的回声实验入口。
4. 发布设置保持 `Settings → Pages → Deploy from a branch → main → /(root)`。

本网站使用纯 HTML、CSS 和 JavaScript，前端无需安装依赖。
