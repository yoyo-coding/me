import type { NowItem, Project } from "@/lib/types";

/* ============================================================
   Now 当前状态
   TODO(replace): 以下均为设计稿示例占位数据，更新时直接修改本文件。
   ============================================================ */
export const nowItems: NowItem[] = [
  { label: "正在开发", text: "博客评论系统" },
  { label: "正在学习", text: "Rust 异步编程" },
  { label: "最近关注", text: "Edge Runtime 的发展" },
];

export const nowUpdatedAt = "2024-03-28";

/* ============================================================
   Projects 项目列表
   TODO(replace): 以下为设计稿示例占位数据（GitHub 链接待填）。
   补充真实项目后删除或替换这些条目；url/repositoryUrl 未提供时省略。
   ============================================================ */
export const projects: Project[] = [
  {
    slug: "yoyo-blog",
    name: "yoyo-blog",
    description: "个人数字花园博客系统，基于 Next.js + TypeScript 构建。",
    technologies: ["Next.js", "TypeScript", "Tailwind"],
    repositoryUrl: "https://github.com/yoyo-coding/yoyo-blog",
    featured: true,
  },
  {
    slug: "css-snippets",
    name: "css-snippets",
    description: "日常积累的 CSS 技巧与实用代码片段集合。",
    technologies: ["CSS", "Snippet"],
    repositoryUrl: "https://github.com/yoyo-coding/css-snippets",
  },
  {
    slug: "mdx-components",
    name: "mdx-components",
    description: "一套可复用的 MDX 组件库，适用于技术博客与文档站点。",
    technologies: ["MDX", "React", "组件库"],
    repositoryUrl: "https://github.com/yoyo-coding/mdx-components",
  },
  {
    slug: "dotfiles",
    name: "dotfiles",
    description: "个人开发环境配置文件，包含 VS Code、终端与 Shell 配置。",
    technologies: ["Dotfiles", "DevEnv"],
    repositoryUrl: "https://github.com/yoyo-coding/dotfiles",
  },
];
