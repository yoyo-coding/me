---
title: CSS 容器查询实战笔记
description: 容器查询改变了响应式布局的思维方式，本文整理实际项目中的用法与陷阱。从 @container 基础语法到组件级适配策略，附上可复用的代码片段。
publishedAt: 2024-02-28
category: CSS
tags:
  - CSS
  - 响应式
---

> TODO(replace): 本文为设计稿示例占位文章，请替换为真实内容。

容器查询（Container Queries）让组件可以响应**父容器**的尺寸而不是视口，这是响应式设计十年来最重要的一次思维转变。

## 基础语法

```css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 96px 1fr;
  }
}
```

## 与媒体查询的区别

| | 媒体查询 | 容器查询 |
|---|---|---|
| 响应对象 | 视口 | 任意祖先容器 |
| 适用场景 | 页面级布局 | 组件级自适应 |
| 复用性 | 差 | 组件换个位置不用改代码 |

## 实战陷阱

1. 忘记声明 `container-type`，查询永远不会命中；
2. 在 `container-type: inline-size` 的元素上直接查询高度——行内尺寸容器没有高度信息；
3. 嵌套容器时名称冲突，建议始终显式命名。

## 配合 aspect-ratio 与 object-fit

```css
.cover {
  aspect-ratio: 16 / 9;
  object-fit: cover;
  width: 100%;
}
```

这三个属性组合可以替代大量 padding-hack 旧代码，CSS 终于能直接表达意图了。
