import { promises as fs } from "fs";
import path from "path";
import type { NowItem, Project } from "@/lib/types";

/**
 * Now / Projects / About 的数据层。
 *
 * 数据来源为 content/ 下的 JSON 文件，可由 /console 后台直接编辑，
 * 无需改动任何源码。文件不存在或格式不符时回退到下方内置默认值，
 * 保证站点在空仓库状态下也能正常渲染。
 */

const dataDir = path.join(process.cwd(), "content");

/* ============================================================
   内置默认值（仅当对应 JSON 文件缺失时使用）
   ============================================================ */

const defaultNowItems: NowItem[] = [
  { label: "正在开发", text: "博客评论系统" },
  { label: "正在学习", text: "Rust 异步编程" },
  { label: "最近关注", text: "Edge Runtime 的发展" },
];

const defaultProjects: Project[] = [
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

const defaultAbout = {
  intro: [
    "执着yoyo是一个个人数字花园，记录开发实践、技术思考与生活随感。",
    "内容偏向前端工程与工具链，偶尔写一些与代码无关的东西。希望能在这里慢慢长出一些有用的东西。",
  ],
  techTags: ["TypeScript", "React", "Next.js", "CSS", "Node.js", "Rust", "DevTools"],
  interests: "前端工程化、开发者体验、静态站点生成、排版与阅读体验、个人知识管理。",
  philosophy: "这个网站是一个「互联网净土」——干净、清新、安静、自由。不追求流量，不追逐热点，只是记录值得记录的东西。",
};

/* ============================================================
   读取函数
   ============================================================ */

async function readJson<T>(file: string, fallback: T, validate: (value: unknown) => T | null): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(dataDir, file), "utf8");
    const parsed: unknown = JSON.parse(raw);
    const result = validate(parsed);
    return result ?? fallback;
  } catch {
    return fallback;
  }
}

function isNowItems(value: unknown): value is NowItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as NowItem).label === "string" &&
        typeof (item as NowItem).text === "string",
    )
  );
}

export async function getNowItems(): Promise<{ items: NowItem[]; updatedAt?: string }> {
  const data = await readJson<{ items: NowItem[]; updatedAt?: string }>(
    "now.json",
    { items: defaultNowItems },
    (value) => {
      if (typeof value !== "object" || value === null) return null;
      const record = value as { items?: unknown; updatedAt?: unknown };
      if (!isNowItems(record.items)) return null;
      return {
        items: record.items,
        updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined,
      };
    },
  );
  return data;
}

function isProjects(value: unknown): value is Project[] {
  return (
    Array.isArray(value) &&
    value.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const p = item as Partial<Project>;
      return (
        typeof p.slug === "string" &&
        typeof p.name === "string" &&
        typeof p.description === "string" &&
        Array.isArray(p.technologies) &&
        p.technologies.every((t) => typeof t === "string")
      );
    })
  );
}

export async function getProjects(): Promise<Project[]> {
  return readJson<Project[]>("projects.json", defaultProjects, (value) => {
    // 文件格式为 { projects: [...] }；也兼容直接顶层数组
    if (typeof value === "object" && value !== null && Array.isArray((value as { projects?: unknown }).projects)) {
      return isProjects((value as { projects: unknown }).projects) ? (value as { projects: Project[] }).projects : null;
    }
    return isProjects(value) ? value : null;
  });
}

export interface AboutData {
  intro: string[];
  techTags: string[];
  interests: string;
  philosophy: string;
}

export async function getAbout(): Promise<AboutData> {
  return readJson<AboutData>("about.json", defaultAbout, (value) => {
    if (typeof value !== "object" || value === null) return null;
    const a = value as Partial<AboutData>;
    if (!Array.isArray(a.intro) || !a.intro.every((s) => typeof s === "string")) return null;
    if (!Array.isArray(a.techTags) || !a.techTags.every((s) => typeof s === "string")) return null;
    if (typeof a.interests !== "string" || typeof a.philosophy !== "string") return null;
    return { intro: a.intro, techTags: a.techTags, interests: a.interests, philosophy: a.philosophy };
  });
}
