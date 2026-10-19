import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

/**
 * /console 后台 API —— 删除内容。
 * DELETE /api/delete  body: { type: "post"|"note", slug }
 * 或整体数据文件的条目级操作走 publish 路由的 update/delete type。
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

export async function DELETE(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  let body: { type?: unknown; slug?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const { type, slug } = body;
  if ((type !== "post" && type !== "note") || typeof slug !== "string" || !safeSlug(slug)) {
    return NextResponse.json({ error: "参数非法：需要 type(post|note) 与合法 slug" }, { status: 400 });
  }

  const dir = type === "post" ? blogDir : notesDir;
  let deleted = false;
  for (const ext of [".md", ".mdx"]) {
    const filePath = path.join(dir, `${slug}${ext}`);
    if (!filePath.startsWith(dir)) continue;
    try {
      await fs.unlink(filePath);
      deleted = true;
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        return NextResponse.json({ error: "删除失败，请查看服务器日志" }, { status: 500 });
      }
    }
  }
  if (!deleted) {
    return NextResponse.json({ error: `未找到文件：${type}/${slug}` }, { status: 404 });
  }
  return NextResponse.json({ ok: true, deleted: `${type}/${slug}` });
}
