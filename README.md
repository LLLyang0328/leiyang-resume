# 雷仰 · 个人简历网站

深色科技风个人简历网站，静态站点（HTML + CSS + JS），可直接部署到 GitHub Pages。

## 本地预览

直接用浏览器打开 `index.html` 即可；推荐起一个本地服务：

```bash
python -m http.server 8000 --directory .
```

然后访问 `http://localhost:8000`。

## 目录结构

```
resume-site/
├── index.html              # 单页网站
├── css/style.css           # 样式
├── js/main.js              # 交互（画廊、灯箱、导航等）
├── assets/
│   ├── images/             # 个人照片 + 画廊图片 + manifest.json
│   ├── video/              # 项目演示视频
│   ├── resume/             # 简历下载文件（docx / pdf）
│   └── favicon.svg
└── scripts/                # 素材预处理脚本（可选）
```

## 发布到 GitHub Pages

1. 初始化仓库并推送：
   ```bash
   git init
   git add .
   git commit -m "个人简历网站"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```
2. 在 GitHub 仓库 Settings → Pages 中，将 Source 设为 `Deploy from a branch`，分支选 `main`，目录 `/ (root)`，保存。
3. 等待 1-2 分钟，访问 `https://<你的用户名>.github.io/<仓库名>/`。

## 更新简历文件

将最新版 `雷仰个人简历.docx` 与 `雷仰个人简历.pdf` 放入 `assets/resume/` 即可，网页会自动提供下载。
