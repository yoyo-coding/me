import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";
import type { BlogPost, Note } from "@/lib/types";

const contentDir = path.join(process.cwd(), "content");
const blogDir = path.join(contentDir, "blog");
const notesDir = path.join(contentDir, "notes");

/* ============================================================
   Markdown → HTML 渲染管线
   remark(解析) → GFM → remark-rehype → slug 锚点 → 代码高亮 → HTML
   ============================================================ */

/** rehype 插件：为 pre 套一层 .yoyo-code-block 容器并补全复制按钮（按钮行为在客户端激活） */
function rehypeCodeBlockContainer() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre" || index === undefined || !parent) return;
      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["yoyo-code-block"] },
        children: [
          node,
          {
            type: "element",
            tagName: "button",
            properties: {
              type: "button",
              className: ["yoyo-copy-btn"],
              "ariaLabel": "复制代码",
              "dataCodeCopy": "true",
            },
            children: [
              { type: "text", value: "复制" },
              {
                type: "element",
                tagName: "span",
                properties: { className: ["yoyo-copy-feedback"], "ariaLive": "polite" },
                children: [],
              },
            ],
          },
        ],
      };
      parent.children[index] = wrapper;
      return index + 1;
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSlug)
  .use(rehypeHighlight, { detect: true, ignoreMissing: true })
  .use(rehypeCodeBlockContainer)
  .use(rehypeStringify);

/** 渲染 markdown；任何解析错误都以 Error 抛出，由调用方降级处理 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}

/* ============================================================
   Frontmatter 解析与校验
   ============================================================ */

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function strArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function bool(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

/**
 * 将 frontmatter 数据规范化为 BlogPost。
 * 必填字段缺失时抛出错误（单篇文章错误不会影响其他文章）。
 */
function toBlogPost(slug: string, data: Record<string, unknown>): BlogPost {
  const title = str(data.title);
  const publishedAt = data.publishedAt instanceof Date
    ? data.publishedAt.toISOString().slice(0, 10)
    : str(data.publishedAt);
  if (!title || !publishedAt) {
    throw new Error(`文章 ${slug} 缺少必填字段（title / publishedAt）`);
  }
  const updatedAtRaw = data.updatedAt;
  const updatedAt = updatedAtRaw instanceof Date
    ? updatedAtRaw.toISOString().slice(0, 10)
    : str(updatedAtRaw) || undefined;
  return {
    slug,
    title,
    description: str(data.description),
    publishedAt,
    updatedAt: updatedAt || undefined,
    category: str(data.category) || undefined,
    tags: strArray(data.tags),
    draft: bool(data.draft),
    readingTime: typeof data.readingTime === "number" ? data.readingTime : undefined,
    coverImage: str(data.coverImage) || undefined,
  };
}

/** 规范化 Note 的 frontmatter；content 来自 markdown 正文 */
function toNote(slug: string, data: Record<string, unknown>, content: string): Note {
  const createdAtRaw = data.createdAt;
  const createdAt = createdAtRaw instanceof Date
    ? createdAtRaw.toISOString()
    : str(data.createdAt);
  if (!createdAt) {
    throw new Error(`Note ${slug} 缺少必填字段（createdAt）`);
  }
  return {
    slug,
    content,
    createdAt,
    tags: strArray(data.tags).length > 0 ? strArray(data.tags) : undefined,
    draft: bool(data.draft),
  };
}

/* ============================================================
   文件读取
   ============================================================ */

async function readMarkdownFiles(dir: string): Promise<{ slug: string; raw: string }[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    // 目录不存在 → 视为空内容集（网站不应因缺少内容目录而失效）
    return [];
  }
  const files = await Promise.all(
    entries
      .filter((name) => name.endsWith(".md") || name.endsWith(".mdx"))
      .map(async (name) => {
        const raw = await fs.readFile(path.join(dir, name), "utf8");
        return { slug: name.replace(/\.mdx?$/, ""), raw };
      }),
  );
  return files;
}

async function parsePostFile(file: { slug: string; raw: string }): Promise<BlogPost | null> {
  try {
    const { data } = matter(file.raw);
    return toBlogPost(file.slug, data);
  } catch (error) {
    // 单篇文章格式错误 → 记录并跳过，不影响整站
    console.error(`[content] 解析文章失败，已跳过: ${file.slug}`, error);
    return null;
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const files = await readMarkdownFiles(blogDir);
  const posts = await Promise.all(files.map(parsePostFile));
  const published = posts
    .filter((post): post is BlogPost => post !== null && post.draft !== true)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return published;
}

export async function getBlogPost(slug: string): Promise<{ post: BlogPost; html: string } | null> {
  const filePathMd = path.join(blogDir, `${slug}.md`);
  const filePathMdx = path.join(blogDir, `${slug}.mdx`);
  let raw: string;
  try {
    raw = await fs.readFile(filePathMd, "utf8").catch(() => fs.readFile(filePathMdx, "utf8"));
  } catch {
    return null;
  }
  try {
    const { data, content } = matter(raw);
    const post = toBlogPost(slug, data);
    // 草稿不可公开访问
    if (post.draft) return null;
    const html = await renderMarkdown(content);
    return { post, html };
  } catch (error) {
    console.error(`[content] 渲染文章失败: ${slug}`, error);
    return null;
  }
}

export async function getAllNotes(): Promise<Note[]> {
  const files = await readMarkdownFiles(notesDir);
  const notes = await Promise.all(
    files.map(async (file) => {
      try {
        const { data, content } = matter(file.raw);
        return toNote(file.slug, data, content.trim());
      } catch (error) {
        console.error(`[content] 解析 Note 失败，已跳过: ${file.slug}`, error);
        return null;
      }
    }),
  );
  return notes
    .filter((note): note is Note => note !== null && note.draft !== true)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** 所有 Blog 标签及计数（按使用频次降序） */
export async function getAllBlogTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getAllBlogPosts();
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh"));
}

/** 估算阅读时长（中文按字数、英文按词数，约 300 字/分钟） */
export function estimateReadingTime(text: string): number {
  const cjkCount = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const wordCount = text
    .replace(/[\u4e00-\u9fff]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round((cjkCount + wordCount) / 300));
}
