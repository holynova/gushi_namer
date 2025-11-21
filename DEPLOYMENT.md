# GitHub Pages 部署说明

本项目已配置自动部署到 GitHub Pages。

## 自动部署

当代码推送到 `main` 分支时，GitHub Actions 会自动：
1. 安装依赖 (使用 pnpm)
2. 构建项目
3. 部署到 GitHub Pages

## 手动触发部署

在 GitHub 仓库页面：
1. 进入 **Actions** 标签
2. 选择 **Deploy to GitHub Pages** workflow
3. 点击 **Run workflow** 按钮

## 首次设置

在 GitHub 仓库中启用 GitHub Pages：
1. 进入仓库的 **Settings** > **Pages**
2. 在 **Source** 下选择 **GitHub Actions**
3. 保存设置

部署完成后，网站将在以下地址访问：
`https://holynova.github.io/gushi_namer/`

## 本地构建测试

```bash
pnpm build
pnpm preview
```
