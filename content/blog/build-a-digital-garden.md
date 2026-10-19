---
title: 从零搭建个人数字花园
description: 记录从选型到部署的完整过程，包括静态生成、评论系统集成与 SEO 优化。从域名注册到 CI/CD 流水线，一步步搭起一个属于自己的数字花园。
publishedAt: 2024-03-15
category: 建站
tags:
  - 建站
  - 前端
---

> TODO(replace): 本文为设计稿示例占位文章，请替换为真实内容。删除此提示即可。

「数字花园」不同于传统的博客：文章不是一次性发布的产品，而是长期培育的植物。这篇文章记录我从零搭建这座花园的完整过程。

## 为什么选择数字花园

传统博客的文章按时间倒序排列，旧内容很快被淹没。数字花园则强调：

- **持续培育**：文章可以长期处于「生长中」状态；
- **双向链接**：想法之间互相引用，形成网络；
- **公开学习**：把不完美的思考也展示出来。

## 技术选型

最终选择 Next.js + TypeScript 的原因很朴素：类型安全、静态生成、生态成熟。

```ts
// 静态生成所有文章路由
export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

Markdown 内容通过 gray-matter 解析 frontmatter，再经 unified 管线渲染成 HTML——没有数据库，没有后端，内容即文件。

## 部署与 CI/CD

静态导出后部署到任意支持静态托管平台即可。每次 `git push` 触发流水线：类型检查 → 构建 → 部署，全程不到两分钟。

## SEO 与可发现性

站点级 metadata、每篇文章独立的 Open Graph、自动生成的 sitemap 与 robots.txt——这些在 Next.js 里都是约定式的文件，几乎零成本。

## 写在最后

花园才刚刚开垦。希望半年后回头看，这里的植物已经长得有些模样了。
