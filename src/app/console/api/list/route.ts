import { NextResponse } from "next/server";
import { getAllBlogPosts, getAllNotes } from "@/lib/content";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * /console 后台 API —— 列出全部内容（含草稿与 JSON 数据文件内容），供后台管理/编辑/删除使用。
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const blogDir = path.join(process.cwd(), "content", "blog");
const notesDir = path.join(process.cwd(), "content", "notes");
const dataDir = path.join(process.cwd(), "content");

function authorize(request: Request): boolean {
  const token = process.env.CONSOLE_TOKEN;
  const provided = request.headers.get("x-console-token");
  if (token) return provided === token;
  const host = request.headers.get("host") ?? "";
  return /^(localhost|127\.0\.0\.1|::1)(:\d+)?$/.test(host);
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const [posts, notes] = await Promise.all([getAllBlogPosts(), getAllNotes()]);

  // 草稿不在 getAll* 中返回，这里单独扫一遍
  const drafts: { type: "post" | "note"; slug: string; title: string }[] = [];
  for (const [dir, type] of [[blogDir, "post"], [notesDir, "note"]] as const) {
    let files: string[] = [];
    try {
      files = await fs.readdir(dir);
    } catch {
      continue;
    }
    for (const name of files.filter((n) => n.endsWith(".md") || n.endsWith(".mdx"))) {
      try {
        const raw = await fs.readFile(path.join(dir, name), "utf8");
        const { data } = matter(raw);
        if (data.draft === true) {
          drafts.push({
            type,
            slug: name.replace(/\.mdx?$/, ""),
            title: typeof data.title === "string" ? data.title : typeof data.createdAt === "string" ? data.createdAt : name,
          });
        }
      } catch {
        // 忽略解析失败的文件
      }
    }
  }

  // JSON 数据文件内容（编辑回填用；缺失返回 null）
  async function readDataFile(name: string): Promise<unknown | null> {
    try {
      return JSON.parse(await fs.readFile(path.join(dataDir, name), "utf8"));
    } catch {
      return null;
    }
  }
  const [nowData, projectsData, aboutData] = await Promise.all([
    readDataFile("now.json"),
    readDataFile("projects.json"),
    readDataFile("about.json"),
  ]);

  return NextResponse.json({
    posts: posts.map((p) => ({ slug: p.slug, title: p.title, publishedAt: p.publishedAt, tags: p.tags })),
    notes: notes.map((n) => ({ slug: n.slug, createdAt: n.createdAt, excerpt: n.content.slice(0, 50) })),
    drafts,
    now: nowData,
    projects: projectsData,
    about: aboutData,
  });
}
