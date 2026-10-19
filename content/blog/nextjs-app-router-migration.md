---
title: Next.js App Router 迁移指南
description: 从 Pages Router 迁移到 App Router 的实战经验，涵盖路由结构、数据获取、布局嵌套与服务端组件的心智模型转变。
publishedAt: 2024-01-20
category: 前端
tags:
  - Next.js
  - 前端
---

> TODO(replace): 本文为设计稿示例占位文章，请替换为真实内容。

## 路由结构的变化

`pages/` 目录变为 `app/` 目录，文件约定从「页面即模块」变为「片段即组合」：

```txt
app/
├── layout.tsx    # 根布局，包裹所有页面
├── page.tsx      # 路由 /
└── blog/
    ├── page.tsx      # 路由 /blog
    └── [slug]/
        └── page.tsx  # 路由 /blog/:slug
```

## 数据获取：从 getStaticProps 到 RSC

服务端组件让「请求即渲染」变得直接：

```tsx
// 这段代码只在服务端执行
export default async function BlogPage() {
  const posts = await getAllBlogPosts();
  return <PostList posts={posts} />;
}
```

不再需要 `getStaticProps` / `getServerSideProps` 的心智负担。

## 迁移时的三个坑

1. **`'use client'` 边界**：默认全是服务端组件，只有需要状态/事件的组件才标记客户端；
2. **布局不重渲染**：`layout.tsx` 在导航间保持挂载，不能依赖它重置页面状态；
3. **metadata 代替 Head**：`next/head` 被 `metadata` 导出替代，模板用 `title.template`。

## 值得迁移吗

如果项目要长期维护，值得。服务端组件减少了大量客户端 JS，类型安全也更好。
