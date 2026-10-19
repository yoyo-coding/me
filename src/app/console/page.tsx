"use client";

import { useEffect, useState } from "react";

/**
 * /console 后台：发布新文章、发布随感、查看已发布内容。
 * 静态导出下的本机管理面板 —— 提交走 /console/api/publish。
 */

type Tab = "post" | "note" | "now" | "projects" | "about";

interface ConsoleItem {
  slug: string;
  title?: string;
  publishedAt?: string;
  createdAt?: string;
  excerpt?: string;
  tags?: string[];
}

export default function ConsolePage() {
  const [tab, setTab] = useState<Tab>("post");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<{ posts: ConsoleItem[]; notes: ConsoleItem[]; drafts: { type: string; slug: string; title: string }[] } | null>(null);

  // 文章表单
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [publishedAt, setPublishedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [draft, setDraft] = useState(false);

  // 随感表单
  const [noteContent, setNoteContent] = useState("");
  const [noteTags, setNoteTags] = useState("");

  // Now 表单（每行一条「标签|内容」）
  const [nowLines, setNowLines] = useState("正在开发|博客评论系统\n正在学习|Rust 异步编程");
  // Projects 表单（JSON 文本）
  const [projectsJson, setProjectsJson] = useState("");
  // About 表单
  const [aboutIntro, setAboutIntro] = useState("");
  const [aboutTags, setAboutTags] = useState("");
  const [aboutInterests, setAboutInterests] = useState("");
  const [aboutPhilosophy, setAboutPhilosophy] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("yoyo-console-token");
    if (saved) setToken(saved);
  }, []);

  async function loadList(t: string) {
    try {
      const res = await fetch("/console/api/list", { headers: { "x-console-token": t }, cache: "no-store" });
      if (!res.ok) return;
      setItems(await res.json());
    } catch {
      // 列表加载失败不影响主功能
    }
  }

  useEffect(() => {
    if (token) {
      localStorage.setItem("yoyo-console-token", token);
      void loadList(token);
    }
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const payload =
        tab === "post"
          ? {
              type: "post",
              title,
              description,
              category,
              publishedAt,
              draft,
              tags: tags.split(/[,，\s]+/).filter(Boolean),
              content,
            }
          : tab === "note"
            ? {
                type: "note",
                draft: false,
                tags: noteTags.split(/[,，\s]+/).filter(Boolean),
                content: noteContent,
              }
            : tab === "now"
              ? {
                  type: "now",
                  data: {
                    items: nowLines
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => {
                        const [label, ...rest] = line.split("|");
                        return { label: label.trim(), text: rest.join("|").trim() };
                      })
                      .filter((i) => i.label && i.text),
                  },
                }
              : tab === "projects"
                ? { type: "projects", data: JSON.parse(projectsJson) }
                : {
                    type: "about",
                    data: {
                      intro: aboutIntro.split("\n").map((s) => s.trim()).filter(Boolean),
                      techTags: aboutTags.split(/[,，\s]+/).filter(Boolean),
                      interests: aboutInterests,
                      philosophy: aboutPhilosophy,
                    },
                  };
      const res = await fetch("/console/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-console-token": token },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const hint = tab === "projects" ? "（projects 需合法 JSON：{ \"projects\": [...] }）" : "";
        setStatus({ kind: "err", text: `${data.error ?? "发布失败"}${hint}` });
      } else {
        setStatus({ kind: "ok", text: `发布成功！文件：${data.file}` });
        if (tab === "post") {
          setTitle(""); setDescription(""); setCategory(""); setTags(""); setContent(""); setDraft(false);
        } else if (tab === "note") {
          setNoteContent(""); setNoteTags("");
        }
        void loadList(token);
      }
    } catch (error) {
      setStatus({ kind: "err", text: `网络错误：${String(error)}` });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="yoyo-console">
      <div className="yoyo-content">
        <header className="yoyo-console-header">
          <h1 className="yoyo-console-title">内容管理台</h1>
          <p className="yoyo-console-desc">发布文章与随感、维护首页 Now / Projects / About，写入 content/ 目录后自动进入前台渲染管线。</p>
        </header>

        <div className="yoyo-console-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "post"} className="yoyo-console-tab" data-active={tab === "post"} onClick={() => setTab("post")}>
            发布文章
          </button>
          <button type="button" role="tab" aria-selected={tab === "note"} className="yoyo-console-tab" data-active={tab === "note"} onClick={() => setTab("note")}>
            发布随感
          </button>
          <button type="button" role="tab" aria-selected={tab === "now"} className="yoyo-console-tab" data-active={tab === "now"} onClick={() => setTab("now")}>
            Now 板块
          </button>
          <button type="button" role="tab" aria-selected={tab === "projects"} className="yoyo-console-tab" data-active={tab === "projects"} onClick={() => setTab("projects")}>
            Projects
          </button>
          <button type="button" role="tab" aria-selected={tab === "about"} className="yoyo-console-tab" data-active={tab === "about"} onClick={() => setTab("about")}>
            About 页
          </button>
        </div>

        <form className="yoyo-console-form" onSubmit={submit}>
          {tab === "post" ? (
            <>
              <label className="yoyo-console-field">
                <span>标题 *</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="文章标题" />
              </label>
              <label className="yoyo-console-field">
                <span>摘要</span>
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="一句话描述（列表页展示）" />
              </label>
              <div className="yoyo-console-row">
                <label className="yoyo-console-field">
                  <span>分类</span>
                  <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="如：前端" />
                </label>
                <label className="yoyo-console-field">
                  <span>发布日期</span>
                  <input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
                </label>
              </div>
              <label className="yoyo-console-field">
                <span>标签（逗号分隔）</span>
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, 随笔" />
              </label>
              <label className="yoyo-console-field">
                <span>正文（Markdown）*</span>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14} required placeholder="支持 Markdown 语法" />
              </label>
              <label className="yoyo-console-check">
                <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} />
                <span>保存为草稿（前台不可见）</span>
              </label>
            </>
          ) : tab === "note" ? (
            <>
              <label className="yoyo-console-field">
                <span>随感内容 *</span>
                <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={5} required placeholder="此刻的想法…" />
              </label>
              <label className="yoyo-console-field">
                <span>标签（逗号分隔，可选）</span>
                <input value={noteTags} onChange={(e) => setNoteTags(e.target.value)} placeholder="debug, 生活" />
              </label>
            </>
          ) : tab === "now" ? (
            <>
              <p className="yoyo-console-muted">每行一条，格式：标签|内容。保存后整页替换首页 NOW 板块。</p>
              <label className="yoyo-console-field">
                <span>Now 条目 *</span>
                <textarea value={nowLines} onChange={(e) => setNowLines(e.target.value)} rows={6} required placeholder={"正在开发|博客评论系统\n正在学习|Rust 异步编程"} />
              </label>
            </>
          ) : tab === "projects" ? (
            <>
              <p className="yoyo-console-muted">粘贴完整 JSON，保存后整体替换 Projects 页项目列表。字段：slug, name, description, technologies[], repositoryUrl?, featured?</p>
              <label className="yoyo-console-field">
                <span>projects.json *</span>
                <textarea value={projectsJson} onChange={(e) => setProjectsJson(e.target.value)} rows={12} required placeholder={'{\n  "projects": [\n    { "slug": "demo", "name": "demo", "description": "…", "technologies": ["TS"], "repositoryUrl": "https://github.com/yoyo-coding/demo" }\n  ]\n}'} />
              </label>
            </>
          ) : (
            <>
              <p className="yoyo-console-muted">保存后整体替换 About 页对应内容。</p>
              <label className="yoyo-console-field">
                <span>简介（每行一段）*</span>
                <textarea value={aboutIntro} onChange={(e) => setAboutIntro(e.target.value)} rows={4} required placeholder="执着yoyo是一个个人数字花园…" />
              </label>
              <label className="yoyo-console-field">
                <span>关注的技术（逗号分隔）*</span>
                <input value={aboutTags} onChange={(e) => setAboutTags(e.target.value)} placeholder="TypeScript, React, Next.js" />
              </label>
              <label className="yoyo-console-field">
                <span>兴趣方向 *</span>
                <textarea value={aboutInterests} onChange={(e) => setAboutInterests(e.target.value)} rows={3} required />
              </label>
              <label className="yoyo-console-field">
                <span>网站理念 *</span>
                <textarea value={aboutPhilosophy} onChange={(e) => setAboutPhilosophy(e.target.value)} rows={3} required />
              </label>
            </>
          )}

          <div className="yoyo-console-actions">
            <button type="submit" className="yoyo-console-submit" disabled={submitting}>
              {submitting
                ? "发布中…"
                : tab === "post"
                  ? "发布文章"
                  : tab === "note"
                    ? "发布随感"
                    : tab === "now"
                      ? "保存 Now 板块"
                      : tab === "projects"
                        ? "保存 Projects"
                        : "保存 About"}
            </button>
          </div>
        </form>

        {status && (
          <p className="yoyo-console-status" data-kind={status.kind} role="status">
            {status.text}
          </p>
        )}

        <section className="yoyo-console-list" aria-label="已发布内容">
          <h2 className="yoyo-section-title">已发布（本机生成数据）</h2>
          {items ? (
            <>
              <h3 className="yoyo-console-subtitle">文章 {items.posts.length} 篇{items.drafts.length > 0 && ` · 草稿 ${items.drafts.length} 篇`}</h3>
              <ul className="yoyo-console-items">
                {items.posts.map((p) => (
                  <li key={p.slug}>
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">{p.title}</a>
                    <time>{p.publishedAt}</time>
                  </li>
                ))}
                {items.drafts.filter((d) => d.type === "post").map((d) => (
                  <li key={d.slug} data-draft>
                    <span>{d.title}（草稿）</span>
                  </li>
                ))}
              </ul>
              <h3 className="yoyo-console-subtitle">随感 {items.notes.length} 条</h3>
              <ul className="yoyo-console-items">
                {items.notes.slice(0, 10).map((n) => (
                  <li key={n.slug}>
                    <span>{n.excerpt}</span>
                    <time>{n.createdAt?.slice(0, 10)}</time>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="yoyo-console-muted">列表加载中或本机访问不可用…</p>
          )}
        </section>
      </div>
    </div>
  );
}
