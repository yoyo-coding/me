# 执着yoyo · 个人博客

个人数字花园，基于 **Next.js 15 (App Router) + React 19 + TypeScript** 构建。
UI 严格还原已交付的设计稿（6 个页面：首页 / 首页·深色 / Blog / Notes / Projects / About）。

## 快速开始

```bash
pnpm install        # 安装依赖
pnpm dev            # 开发模式  http://localhost:3000
pnpm build          # 生产构建（全静态生成）
pnpm start          # 运行生产构建
pnpm typecheck      # TypeScript 类型检查
pnpm lint           # ESLint
```

> 本仓库使用 pnpm；首次构建前请确认 Node.js ≥ 18.18。

## 目录结构

```txt
content/
  blog/                 # Blog 文章（一篇文章一个 .md，frontmatter 定义元数据）
  notes/                # Notes 随感（一条随感一个 .md）
src/
  app/                  # App Router 页面与 SEO 约定文件
    page.tsx            # 首页（首屏仅头像 + 滚动内容板块）
    blog/page.tsx       # Blog 列表（标签过滤 + 加载更多）
    blog/[slug]/        # 文章详情（目录 / 代码高亮 / 复制 / 进度条）
    notes/page.tsx      # Notes 时间线
    projects/page.tsx   # 项目列表 + GitHub 卡片
    about/page.tsx      # 关于
    not-found.tsx       # 404
    sitemap.ts          # 自动生成 sitemap.xml
    robots.ts           # robots.txt
    icon.svg            # 站点图标
    globals.css         # 设计 Token（yoyo-* 变量，浅色/深色双主题）
  components/           # 导航栏 / 页脚 / 主题切换 / 滚动渐入 / 阅读辅助 等
  lib/
    site-config.ts      # 站点配置（名称、GitHub、头像路径……）
    content.ts          # Markdown 读取与渲染管线（frontmatter 校验、草稿过滤）
    data.ts             # Now 与 Projects 数据
    types.ts            # BlogPost / Note / Project 类型
    format.ts           # 统一日期格式化
  styles/               # 按页面拆分的 CSS（layout / home / post / about / projects）
public/
  avatar-placeholder.svg # 头像占位图（可替换）
```

## 写内容

### 新增 Blog 文章

在 `content/blog/` 新建 `my-slug.md`：

```md
---
title: 文章标题
description: 一句话摘要
publishedAt: 2024-03-15        # 必填，YYYY-MM-DD
updatedAt: 2024-04-01          # 可选
category: 建站                 # 可选
tags: [建站, 前端]
draft: true                    # 可选；草稿不会出现在列表，也无法通过 URL 访问
---

正文 Markdown（支持 GFM、代码高亮、表格、引用……）
```

- slug 即文件名（`my-slug.md` → `/blog/my-slug`），发布后请勿改名。
- 必填字段缺失时该篇会被跳过并在构建日志中提示，不影响整站。

### 新增 Note 随感

在 `content/notes/` 新建 `2024-04-01-my-note.md`：

```md
---
createdAt: 2024-04-01T14:20:00+08:00   # 必填
tags: [CSS]                            # 可选
---
随感正文（纯文本或简单 Markdown）。
```

### 更新 Now / Projects

直接编辑 `src/lib/data.ts`，字段含义见文件内注释。

## ⚠️ 待替换的占位信息（TODO(replace)）

以下均为设计稿示例或占位符，**不是真实数据**，上线前请替换：

| 位置 | 占位内容 | 替换方式 |
|---|---|---|
| `src/lib/site-config.ts` | GitHub 用户名 `your-github-username` | 改 `githubUsername` 字段 |
| `src/lib/site-config.ts` | 站点 URL `https://yoyo-blog.example.com` | 部署后改为真实域名（影响 canonical/sitemap/OG） |
| `src/lib/site-config.ts` | 头像路径 | 替换 `public/avatar-placeholder.svg` 或改 `avatar` 字段 |
| `content/blog/*.md` | 6 篇示例文章（含「TODO(replace)」提示） | 替换为真实文章 |
| `content/notes/*.md` | 10 条示例随感 | 替换为真实随感 |
| `src/lib/data.ts` | Now 三条状态、Projects 四个项目（仓库链接为占位） | 改为真实信息 |
| `src/app/about/page.tsx` | 关注的技术标签 | 按需调整 |
| `src/app/icon.svg` | 临时字母图标 | 替换为正式 favicon |

搜索 `TODO(replace)` 可定位全部占位点。

## 实现说明

- **主题系统**：浅色 / 深色 / 跟随系统三态循环切换；`<html class="dark">` 驱动设计 Token；首屏内联脚本防闪烁；选择持久化于 `localStorage`，并响应系统主题变化。
- **内容管线**：remark → remark-gfm → rehype-slug（标题锚点）→ rehype-highlight（代码高亮）→ 自定义容器（复制按钮）→ HTML。服务端渲染，零客户端 MDX 运行时。
- **阅读体验**：桌面端悬浮目录（IntersectionObserver 高亮当前小节）、阅读进度条（rAF 节流）、代码复制（Clipboard API，成功/失败反馈）。
- **无障碍**：跳转链接、语义化标签、`aria-current` 导航态、焦点样式、`prefers-reduced-motion` 全局尊重、图标按钮均可读。
- **性能**：全站静态生成（`force-static`），客户端组件仅限导航/主题/过滤/阅读辅助等交互件；无大型运行时依赖。
- **SEO**：页面级 metadata 与 Open Graph、规范 URL、sitemap、robots、语义化 HTML。
