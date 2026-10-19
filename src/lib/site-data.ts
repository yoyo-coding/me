import { promises as fs } from "fs";
import path from "path";
import type { NowItem, Project } from "@/lib/types";

/**
 * Now / Projects / About 的数据层。
 *
 * 数据来源为 content/ 下的 JSON 文件，由 /console 后台编辑发布。
 * 文件不存在时不显示任何预设内容（空白状态），前台各板块自行渲染空态。
 */

const dataDir = path.join(process.cwd(), "content");

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
  return readJson<{ items: NowItem[]; updatedAt?: string }>(
    "now.json",
    { items: [] },
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
  return readJson<Project[]>("projects.json", [], (value) => {
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
  return readJson<AboutData>(
    "about.json",
    { intro: [], techTags: [], interests: "", philosophy: "" },
    (value) => {
      if (typeof value !== "object" || value === null) return null;
      const a = value as Partial<AboutData>;
      if (!Array.isArray(a.intro) || !a.intro.every((s) => typeof s === "string")) return null;
      if (!Array.isArray(a.techTags) || !a.techTags.every((s) => typeof s === "string")) return null;
      if (typeof a.interests !== "string" || typeof a.philosophy !== "string") return null;
      return { intro: a.intro, techTags: a.techTags, interests: a.interests, philosophy: a.philosophy };
    },
  );
}
