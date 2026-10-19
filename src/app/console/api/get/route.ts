import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import matter from "gray-matter";

/**
 * /console 后台 API —— 读取单篇内容供编辑回填。
 * GET /api/get?type=post|note&slug=xxx
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const blogDir = path.join(process.cwd(), "content", "blog");
const notesDir = path.join(process.cwd(), "content", "notes");

function authorize(request: Request): boolean {
  const token = process.env.CONSOLE_TOKEN;
  const provided = request.headers.get("x-console-token");
  if (token) return provided === token;
  const host = request.headers.get("host") ?? "";
  return /^(localhost|127\.0\.0\.1|::1)(:\d+)?$/.test(host);
}

function safeSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/i.test(slug);
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const slug = url.searchParams.get("slug") ?? "";
  if ((type !== "post" && type !== "note") || !safeSlug(slug)) {
    return NextResponse.json({ error: "参数非法：需要 type(post|note) 与合法 slug" }, { status: 400 });
  }

  const dir = type === "post" ? blogDir : notesDir;
  for (const ext of [".md", ".mdx"]) {
    const filePath = path.join(dir, `${slug}${ext}`);
    if (!filePath.startsWith(dir)) continue;
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(raw);
      return NextResponse.json({
        type,
        slug,
        frontmatter: data,
        content,
        file: `content/${type}/${slug}${ext}`,
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        return NextResponse.json({ error: "读取失败" }, { status: 500 });
      }
    }
  }
  return NextResponse.json({ error: `未找到：${type}/${slug}` }, { status: 404 });
}
