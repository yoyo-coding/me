import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { estimateReadingTime } from "@/lib/content";

/**
 * /console 后台 API —— 发布文章与随感。
 *
 * 认证：请求头 `x-console-token` 必须与环境变量 CONSOLE_TOKEN 一致
 *（未设置 CONSOLE_TOKEN 时，仅允许本机 localhost 访问）。
 * 存储：直接写入 content/blog、content/notes 目录下的 Markdown 文件，
 * 与前台静态生成管线完全兼容。
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const blogDir = path.join(process.cwd(), "content", "blog");
const notesDir = path.join(process.cwd(), "content", "notes");
const dataDir = path.join(process.cwd(), "content");

/** content/ 下 JSON 数据文件的合法文件名白名单（防路径穿越） */
const jsonFiles = new Set(["now.json", "projects.json", "about.json"]);

/** 校验访问权限：token 匹配，或本机访问（开发模式） */
function authorize(request: Request): boolean {
  const token = process.env.CONSOLE_TOKEN;
  const provided = request.headers.get("x-console-token");
  if (token) return provided === token;
  // 未配置 token：仅允许本机访问，避免公网裸奔
  const host = request.headers.get("host") ?? "";
  return /^(localhost|127\.0\.0\.1|::1)(:\d+)?$/.test(host);
}

function unauthorized() {
  return NextResponse.json({ error: "未授权：请在环境变量配置 CONSOLE_TOKEN 并在设置中填写相同值" }, { status: 401 });
}

/** slug 合法性：小写字母数字与连字符，防止路径穿越 */
function safeSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug);
}

function frontmatterEscape(value: string): string {
  return value.replace(/"/g, '\\"');
}

/** 组装文章 Markdown（frontmatter + 正文） */
function buildPostMarkdown(input: {
  title: string;
  description: string;
  publishedAt: string;
  category?: string;
  tags: string[];
  draft: boolean;
  content: string;
}): string {
  const lines = [
    "---",
    `title: "${frontmatterEscape(input.title)}"`,
    `description: "${frontmatterEscape(input.description)}"`,
    `publishedAt: ${input.publishedAt}`,
  ];
  if (input.category) lines.push(`category: ${input.category}`);
  if (input.tags.length > 0) {
    lines.push("tags:");
    for (const tag of input.tags) lines.push(`  - ${tag}`);
  }
  if (input.draft) lines.push("draft: true");
  lines.push("---", "", input.content.trim(), "");
  return lines.join("\n");
}

/** 组装随感 Markdown */
function buildNoteMarkdown(input: { createdAt: string; tags: string[]; draft: boolean; content: string }): string {
  const lines = ["---", `createdAt: ${input.createdAt}`];
  if (input.tags.length > 0) {
    lines.push("tags:");
    for (const tag of input.tags) lines.push(`  - ${tag}`);
  }
  if (input.draft) lines.push("draft: true");
  lines.push("---", input.content.trim(), "");
  return lines.join("\n");
}

/** 由标题生成默认 slug（中文转拼音不可用，退化为日期 + 短哈希） */
function defaultSlug(title: string): string {
  const date = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  return `${date}-${hash.toString(36)}`;
}

export async function POST(request: Request) {
  if (!authorize(request)) return unauthorized();
  let body: Record<string, unknown>;
  try {
    // PowerShell 老客户端可能以 latin1 发送 UTF-8 字节；浏览器 fetch 恒为正确 UTF-8。
    // 这里统一按「原始字节 → UTF-8」解码一次，两种来源都正确。
    const buf = Buffer.from(await request.arrayBuffer());
    body = JSON.parse(buf.toString("utf8"));
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const type = body.type;
  try {
    if (type === "post") {
      const title = typeof body.title === "string" ? body.title.trim() : "";
      const content = typeof body.content === "string" ? body.content : "";
      if (!title || !content.trim()) {
        return NextResponse.json({ error: "标题与正文不能为空" }, { status: 400 });
      }
      const slug = typeof body.slug === "string" && safeSlug(body.slug) ? body.slug : defaultSlug(title);
      const md = buildPostMarkdown({
        title,
        description: typeof body.description === "string" ? body.description.trim() : "",
        publishedAt: typeof body.publishedAt === "string" && body.publishedAt
          ? body.publishedAt
          : new Date().toISOString().slice(0, 10),
        category: typeof body.category === "string" && body.category.trim() ? body.category.trim() : undefined,
        tags: Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string" && t.trim() !== "").map((t) => t.trim()) : [],
        draft: body.draft === true,
        content,
      });
      const readingTime = estimateReadingTime(content);
      const filePath = path.join(blogDir, `${slug}.md`);
      if (!filePath.startsWith(blogDir)) return NextResponse.json({ error: "非法路径" }, { status: 400 });
      await fs.writeFile(filePath, md, "utf8");
      return NextResponse.json({ ok: true, slug, file: `content/blog/${slug}.md`, readingTime });
    }

    if (type === "note") {
      const content = typeof body.content === "string" ? body.content.trim() : "";
      if (!content) return NextResponse.json({ error: "随感内容不能为空" }, { status: 400 });
      const createdAt = typeof body.createdAt === "string" && body.createdAt
        ? body.createdAt
        : new Date().toISOString();
      const datePart = createdAt.slice(0, 10).replace(/:/g, "-");
      let hash = 0;
      for (const ch of content) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
      const slug = typeof body.slug === "string" && safeSlug(body.slug)
        ? body.slug
        : `${datePart}-${hash.toString(36)}`;
      const md = buildNoteMarkdown({
        createdAt,
        tags: Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string" && t.trim() !== "").map((t) => t.trim()) : [],
        draft: body.draft === true,
        content,
      });
      const filePath = path.join(notesDir, `${slug}.md`);
      if (!filePath.startsWith(notesDir)) return NextResponse.json({ error: "非法路径" }, { status: 400 });
      await fs.writeFile(filePath, md, "utf8");
      return NextResponse.json({ ok: true, slug, file: `content/notes/${slug}.md` });
    }

    if (type === "now" || type === "projects" || type === "about") {
      // JSON 数据文件整体覆写：now / projects / about
      const file = type === "now" ? "now.json" : type === "projects" ? "projects.json" : "about.json";
      if (!jsonFiles.has(file)) return NextResponse.json({ error: "非法文件" }, { status: 400 });
      const payload = body.data;
      if (typeof payload !== "object" || payload === null) {
        return NextResponse.json({ error: "缺少 data 数据对象" }, { status: 400 });
      }
      if (type === "now") {
        const items = (payload as { items?: unknown }).items;
        if (
          !Array.isArray(items) ||
          items.some((i) => typeof i !== "object" || i === null || typeof (i as { label?: unknown }).label !== "string" || typeof (i as { text?: unknown }).text !== "string")
        ) {
          return NextResponse.json({ error: "now 数据格式：{ items: [{ label, text }] }" }, { status: 400 });
        }
      }
      if (type === "projects") {
        const list = payload as { projects?: unknown };
        const arr = Array.isArray(list.projects) ? list.projects : Array.isArray(payload) ? payload : null;
        if (
          arr === null ||
          arr.some((p) => typeof p !== "object" || p === null || typeof (p as { slug?: unknown }).slug !== "string" || typeof (p as { name?: unknown }).name !== "string" || typeof (p as { description?: unknown }).description !== "string")
        ) {
          return NextResponse.json({ error: "projects 数据格式：{ projects: [{ slug, name, description, technologies, repositoryUrl? }] }" }, { status: 400 });
        }
      }
      if (type === "about") {
        const a = payload as { intro?: unknown; techTags?: unknown; interests?: unknown; philosophy?: unknown };
        const ok =
          Array.isArray(a.intro) && a.intro.every((s) => typeof s === "string") &&
          Array.isArray(a.techTags) && a.techTags.every((s) => typeof s === "string") &&
          typeof a.interests === "string" && typeof a.philosophy === "string";
        if (!ok) {
          return NextResponse.json({ error: "about 数据格式：{ intro: string[], techTags: string[], interests, philosophy }" }, { status: 400 });
        }
      }
      await fs.writeFile(path.join(dataDir, file), JSON.stringify(payload, null, 2) + "\n", "utf8");
      return NextResponse.json({ ok: true, file: `content/${file}` });
    }

    return NextResponse.json({ error: `未知的类型: ${String(type)}` }, { status: 400 });
  } catch (error) {
    console.error("[console-api] 写入失败", error);
    return NextResponse.json({ error: "写入失败，请查看服务器日志" }, { status: 500 });
  }
}
