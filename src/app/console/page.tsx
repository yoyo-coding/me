"use client";

import { useEffect, useState } from "react";

/**
 * /console 后台：发布/编辑/删除文章与随感，编辑 Now / Projects / About。
 * 提交走 /console/api/publish，删除走 /console/api/delete，编辑回填走 /console/api/get。
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

interface ListPayload {
  posts: ConsoleItem[];
  notes: ConsoleItem[];
  drafts: { type: string; slug: string; title: string }[];
  now?: { items?: { label: string; text: string }[]; updatedAt?: string } | null;
  projects?: { projects?: unknown[] } | unknown[] | null;
  about?: { intro?: string[]; techTags?: string[]; interests?: string; philosophy?: string } | null;
}

interface NowRow {
  label: string;
  text: string;
}

interface ProjectRow {
  slug: string;
  name: string;
  description: string;
  technologies: string[];
  repositoryUrl?: string;
  featured?: boolean;
}

function headers(token: string): Record<string, string> {
  return { "Content-Type": "application/json", "x-console-token": token };
}

export default function ConsolePage() {
  const [tab, setTab] = useState<Tab>("post");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<ListPayload | null>(null);

  // 编辑状态：正在编辑的 post/note slug（null = 新建模式）
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);

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

  // Now 表单（条目列表，逐条增删改）
  const [nowRows, setNowRows] = useState<NowRow[]>([{ label: "", text: "" }]);
  // Projects 表单（条目列表，逐条增删改）
  const [projectRows, setProjectRows] = useState<ProjectRow[]>([]);
  // About 表单
  const [aboutIntro, setAboutIntro] = useState("");
  const [aboutTags, setAboutTags] = useState("");
  const [aboutInterests, setAboutInterests] = useState("");
  const [aboutPhilosophy, setAboutPhilosophy] = useState("");

  function resetPostForm() {
    setEditingPost(null);
    setTitle(""); setDescription(""); setCategory(""); setTags(""); setContent(""); setDraft(false);
    setPublishedAt(new Date().toISOString().slice(0, 10));
  }
  function resetNoteForm() {
    setEditingNote(null);
    setNoteContent(""); setNoteTags("");
  }

  async function loadList(t: string) {
    try {
      const res = await fetch("/console/api/list", { headers: { "x-console-token": t }, cache: "no-store" });
      if (!res.ok) return;
      const data: ListPayload = await res.json();
      setItems(data);
      // JSON 数据回填：仅当表单未被用户编辑过时才覆盖（简化：每次加载都回填空表单场景）
      return data;
    } catch {
      return undefined;
    }
  }

  // 首次加载后回填 Now / Projects / About 表单
  function hydrateJsonForms(data: ListPayload) {
    if (data.now?.items && data.now.items.length > 0) {
      setNowRows(data.now.items.map((i) => ({ label: i.label, text: i.text })));
    }
    const pj = Array.isArray(data.projects) ? data.projects : data.projects?.projects;
    if (Array.isArray(pj) && pj.length > 0) {
      setProjectRows(
        pj
          .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
          .map((p) => ({
            slug: String(p.slug ?? ""),
            name: String(p.name ?? ""),
            description: String(p.description ?? ""),
            technologies: Array.isArray(p.technologies) ? p.technologies.map(String) : [],
            repositoryUrl: typeof p.repositoryUrl === "string" ? p.repositoryUrl : undefined,
            featured: p.featured === true,
          })),
      );
    }
    if (data.about) {
      setAboutIntro((data.about.intro ?? []).join("\n"));
      setAboutTags((data.about.techTags ?? []).join(", "));
      setAboutInterests(data.about.interests ?? "");
      setAboutPhilosophy(data.about.philosophy ?? "");
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("yoyo-console-token");
    if (saved) {
      setToken(saved);
      void loadList(saved).then((data) => {
        if (data) hydrateJsonForms(data);
      });
    }
  }, []);

  async function refreshTokenList() {
    await loadList(token);
  }

  /** 编辑文章：拉取内容回填表单 */
  async function startEditPost(slug: string) {
    try {
      const res = await fetch(`/console/api/get?type=post&slug=${encodeURIComponent(slug)}`, {
        headers: { "x-console-token": token },
        cache: "no-store",
      });
      if (!res.ok) {
        setStatus({ kind: "err", text: "读取文章失败" });
        return;
      }
      const data = await res.json();
      const fm = data.frontmatter ?? {};
      setEditingPost(slug);
      setTitle(typeof fm.title === "string" ? fm.title : "");
      setDescription(typeof fm.description === "string" ? fm.description : "");
      setCategory(typeof fm.category === "string" ? fm.category : "");
      setTags(Array.isArray(fm.tags) ? fm.tags.join(", ") : typeof fm.tags === "string" ? fm.tags : "");
      setPublishedAt(typeof fm.publishedAt === "string" ? fm.publishedAt.slice(0, 10) : new Date().toISOString().slice(0, 10));
      setContent(data.content ?? "");
      setDraft(fm.draft === true);
      setTab("post");
      setStatus({ kind: "ok", text: `正在编辑：${slug}` });
    } catch {
      setStatus({ kind: "err", text: "读取文章网络错误" });
    }
  }

  async function startEditNote(slug: string) {
    try {
      const res = await fetch(`/console/api/get?type=note&slug=${encodeURIComponent(slug)}`, {
        headers: { "x-console-token": token },
        cache: "no-store",
      });
      if (!res.ok) {
        setStatus({ kind: "err", text: "读取随感失败" });
        return;
      }
      const data = await res.json();
      const fm = data.frontmatter ?? {};
      setEditingNote(slug);
      setNoteContent(data.content ?? "");
      setNoteTags(Array.isArray(fm.tags) ? fm.tags.join(", ") : "");
      setTab("note");
      setStatus({ kind: "ok", text: `正在编辑：${slug}` });
    } catch {
      setStatus({ kind: "err", text: "读取随感网络错误" });
    }
  }

  /** 删除文章或随感 */
  async function deleteItem(type: "post" | "note", slug: string) {
    if (!window.confirm(`确定删除${type === "post" ? "文章" : "随感"}「${slug}」？此操作不可撤销。`)) return;
    try {
      const res = await fetch("/console/api/delete", {
        method: "DELETE",
        headers: headers(token),
        body: JSON.stringify({ type, slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ kind: "err", text: data.error ?? "删除失败" });
      } else {
        setStatus({ kind: "ok", text: `已删除：${slug}（重建站点后前台生效）` });
        if (type === "post" && editingPost === slug) resetPostForm();
        if (type === "note" && editingNote === slug) resetNoteForm();
        await refreshTokenList();
      }
    } catch {
      setStatus({ kind: "err", text: "删除网络错误" });
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      let payload: Record<string, unknown>;
      if (tab === "post") {
        payload = {
          type: "post",
          title,
          description,
          category,
          publishedAt,
          draft,
          tags: tags.split(/[,，\s]+/).filter(Boolean),
          content,
          ...(editingPost ? { slug: editingPost } : {}),
        };
      } else if (tab === "note") {
        payload = {
          type: "note",
          draft: false,
          tags: noteTags.split(/[,，\s]+/).filter(Boolean),
          content: noteContent,
          ...(editingNote ? { slug: editingNote } : {}),
        };
      } else if (tab === "now") {
        payload = {
          type: "now",
          data: {
            items: nowRows
              .map((r) => ({ label: r.label.trim(), text: r.text.trim() }))
              .filter((i) => i.label && i.text),
            ...(items?.now?.updatedAt ? { updatedAt: items.now.updatedAt } : {}),
          },
        };
      } else if (tab === "projects") {
        payload = {
          type: "projects",
          data: { projects: projectRows.filter((p) => p.slug && p.name && p.description) },
        };
      } else {
        payload = {
          type: "about",
          data: {
            intro: aboutIntro.split("\n").map((s) => s.trim()).filter(Boolean),
            techTags: aboutTags.split(/[,，\s]+/).filter(Boolean),
            interests: aboutInterests,
            philosophy: aboutPhilosophy,
          },
        };
      }
      const res = await fetch("/console/api/publish", {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ kind: "err", text: `${data.error ?? "发布失败"}` });
      } else {
        setStatus({ kind: "ok", text: editingPost || editingNote ? `更新成功！文件：${data.file}` : `发布成功！文件：${data.file}` });
        if (tab === "post") resetPostForm();
        else if (tab === "note") resetNoteForm();
        await refreshTokenList();
      }
    } catch (error) {
      setStatus({ kind: "err", text: `网络错误：${String(error)}` });
    } finally {
      setSubmitting(false);
    }
  }

  /* ------- Now 行操作 ------- */
  function updateNowRow(idx: number, patch: Partial<NowRow>) {
    setNowRows((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }
  function removeNowRow(idx: number) {
    setNowRows((rows) => rows.filter((_, i) => i !== idx));
  }

  /* ------- Projects 行操作 ------- */
  function updateProjectRow(idx: number, patch: Partial<ProjectRow>) {
    setProjectRows((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }
  function removeProjectRow(idx: number) {
    setProjectRows((rows) => rows.filter((_, i) => i !== idx));
  }

  const submitLabel =
    tab === "post"
      ? editingPost ? "保存文章修改" : "发布文章"
      : tab === "note"
        ? editingNote ? "保存随感修改" : "发布随感"
        : tab === "now"
          ? "保存 Now 板块"
          : tab === "projects"
            ? "保存 Projects"
            : "保存 About";

  return (
    <div className="yoyo-console">
      <div className="yoyo-content">
        <header className="yoyo-console-header">
          <h1 className="yoyo-console-title">内容管理台</h1>
          <p className="yoyo-console-desc">发布、编辑、删除文章与随感，维护首页 Now / Projects / About，写入 content/ 目录后自动进入前台渲染管线。</p>
        </header>

        <div className="yoyo-console-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "post"} className="yoyo-console-tab" data-active={tab === "post"} onClick={() => setTab("post")}>
            文章
          </button>
          <button type="button" role="tab" aria-selected={tab === "note"} className="yoyo-console-tab" data-active={tab === "note"} onClick={() => setTab("note")}>
            随感
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
              {editingPost && (
                <p className="yoyo-console-muted">正在编辑「{editingPost}」 · <button type="button" className="yoyo-console-linkbtn" onClick={resetPostForm}>取消编辑，新建文章</button></p>
              )}
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
              {editingNote && (
                <p className="yoyo-console-muted">正在编辑「{editingNote}」 · <button type="button" className="yoyo-console-linkbtn" onClick={resetNoteForm}>取消编辑，新建随感</button></p>
              )}
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
              <p className="yoyo-console-muted">逐条编辑 Now 板块：每条包含「标签」和「内容」，可添加/删除行。保存后整体替换首页 NOW 板块。</p>
              {nowRows.map((row, idx) => (
                <div className="yoyo-console-row" key={idx} data-now-row>
                  <label className="yoyo-console-field">
                    <span>标签</span>
                    <input value={row.label} onChange={(e) => updateNowRow(idx, { label: e.target.value })} placeholder="正在开发" />
                  </label>
                  <label className="yoyo-console-field">
                    <span>内容</span>
                    <input value={row.text} onChange={(e) => updateNowRow(idx, { text: e.target.value })} placeholder="博客评论系统" />
                  </label>
                  <button type="button" className="yoyo-console-del" aria-label="删除此条" onClick={() => removeNowRow(idx)}>删除</button>
                </div>
              ))}
              <button type="button" className="yoyo-console-add" onClick={() => setNowRows((r) => [...r, { label: "", text: "" }])}>+ 添加一条 Now</button>
            </>
          ) : tab === "projects" ? (
            <>
              <p className="yoyo-console-muted">逐条编辑项目：可添加/删除项目卡片。保存后整体替换 Projects 页列表。</p>
              {projectRows.map((row, idx) => (
                <fieldset className="yoyo-console-card" key={idx}>
                  <legend>项目 {idx + 1}</legend>
                  <div className="yoyo-console-row">
                    <label className="yoyo-console-field">
                      <span>slug *</span>
                      <input value={row.slug} onChange={(e) => updateProjectRow(idx, { slug: e.target.value })} placeholder="my-project" />
                    </label>
                    <label className="yoyo-console-field">
                      <span>名称 *</span>
                      <input value={row.name} onChange={(e) => updateProjectRow(idx, { name: e.target.value })} placeholder="My Project" />
                    </label>
                  </div>
                  <label className="yoyo-console-field">
                    <span>描述 *</span>
                    <input value={row.description} onChange={(e) => updateProjectRow(idx, { description: e.target.value })} placeholder="一句话介绍" />
                  </label>
                  <div className="yoyo-console-row">
                    <label className="yoyo-console-field">
                      <span>技术（逗号分隔）</span>
                      <input value={row.technologies.join(", ")} onChange={(e) => updateProjectRow(idx, { technologies: e.target.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean) })} placeholder="TypeScript, React" />
                    </label>
                    <label className="yoyo-console-field">
                      <span>仓库链接</span>
                      <input value={row.repositoryUrl ?? ""} onChange={(e) => updateProjectRow(idx, { repositoryUrl: e.target.value })} placeholder="https://github.com/yoyo-coding/…" />
                    </label>
                  </div>
                  <div className="yoyo-console-row" data-align-end>
                    <label className="yoyo-console-check">
                      <input type="checkbox" checked={row.featured === true} onChange={(e) => updateProjectRow(idx, { featured: e.target.checked })} />
                      <span>精选</span>
                    </label>
                    <button type="button" className="yoyo-console-del" onClick={() => removeProjectRow(idx)}>删除此项目</button>
                  </div>
                </fieldset>
              ))}
              <button
                type="button"
                className="yoyo-console-add"
                onClick={() => setProjectRows((r) => [...r, { slug: "", name: "", description: "", technologies: [], repositoryUrl: "", featured: false }])}
              >
                + 添加一个项目
              </button>
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
              {submitting ? "保存中…" : submitLabel}
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
                  <li key={p.slug} data-editing={editingPost === p.slug}>
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">{p.title}</a>
                    <time>{p.publishedAt}</time>
                    <span className="yoyo-console-item-actions">
                      <button type="button" onClick={() => startEditPost(p.slug)}>编辑</button>
                      <button type="button" data-danger onClick={() => deleteItem("post", p.slug)}>删除</button>
                    </span>
                  </li>
                ))}
                {items.drafts.filter((d) => d.type === "post").map((d) => (
                  <li key={d.slug} data-draft>
                    <span>{d.title}（草稿）</span>
                    <span className="yoyo-console-item-actions">
                      <button type="button" onClick={() => startEditPost(d.slug)}>编辑</button>
                      <button type="button" data-danger onClick={() => deleteItem("post", d.slug)}>删除</button>
                    </span>
                  </li>
                ))}
              </ul>
              <h3 className="yoyo-console-subtitle">随感 {items.notes.length} 条</h3>
              <ul className="yoyo-console-items">
                {items.notes.map((n) => (
                  <li key={n.slug} data-editing={editingNote === n.slug}>
                    <span>{n.excerpt}</span>
                    <time>{n.createdAt?.slice(0, 10)}</time>
                    <span className="yoyo-console-item-actions">
                      <button type="button" onClick={() => startEditNote(n.slug)}>编辑</button>
                      <button type="button" data-danger onClick={() => deleteItem("note", n.slug)}>删除</button>
                    </span>
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
