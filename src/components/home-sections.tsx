import Link from "next/link";
import type { BlogPost, Note } from "@/lib/types";
import { githubUrl, siteConfig } from "@/lib/site-config";
import { getNowItems } from "@/lib/site-data";
import { formatDate, formatNoteTime } from "@/lib/format";
import { Reveal } from "@/components/reveal";

/* ============================================================
   首页各内容板块（设计稿：首页.html）
   首屏（hero）仅头像，滚动后依次：欢迎语 → Blog → Notes → Now → GitHub → About
   ============================================================ */

/** 首屏：仅头像主体，大面积留白是设计本身 */
export function Hero() {
  return (
    <section className="yoyo-hero">
      <div className="yoyo-content yoyo-hero-inner">
        {/* TODO(replace): 头像占位图，真实头像请替换 public/avatar-placeholder.svg 或修改 siteConfig.avatar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={siteConfig.avatar}
          alt={`${siteConfig.name} 的头像`}
          className="yoyo-avatar yoyo-animate-in"
          width={360}
          height={360}
          loading="eager"
          decoding="async"
        />
        <h1 className="yoyo-hero-name">{siteConfig.name}</h1>
      </div>
    </section>
  );
}

export function Welcome() {
  return (
    <Reveal className="yoyo-section yoyo-content yoyo-welcome">
      <h2 className="yoyo-welcome-heading">Welcome to my little corner of the internet.</h2>
      <p className="yoyo-welcome-sub">这里记录开发、思考、随感，以及一些正在发生的事情。</p>
    </Reveal>
  );
}

export function BlogSection({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;
  const [featured, ...rest] = posts;
  return (
    <Reveal className="yoyo-section yoyo-content">
      <div className="yoyo-section-head">
        <h3 className="yoyo-section-title">BLOG</h3>
      </div>
      <div className="yoyo-blog-list">
        <article className="yoyo-blog-featured">
          <Link href={`/blog/${featured.slug}`} className="yoyo-blog-title">
            {featured.title}
          </Link>
          <p className="yoyo-blog-excerpt">{featured.description}</p>
          <div className="yoyo-blog-meta">
            <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
            {featured.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="yoyo-tag">
                {tag}
              </span>
            ))}
          </div>
        </article>
        {rest.map((post) => (
          <article key={post.slug} className="yoyo-blog-plain">
            <Link href={`/blog/${post.slug}`} className="yoyo-blog-title">
              {post.title}
            </Link>
            <p className="yoyo-blog-excerpt">{post.description}</p>
            <div className="yoyo-blog-meta">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="yoyo-tag">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
      <Link href="/blog" className="yoyo-read-all">
        阅读全部文章 →
      </Link>
    </Reveal>
  );
}

export function NotesSection({ notes }: { notes: Note[] }) {
  if (notes.length === 0) return null;
  return (
    <Reveal className="yoyo-section yoyo-content">
      <div className="yoyo-section-head">
        <h3 className="yoyo-section-title">NOTES</h3>
      </div>
      <div className="yoyo-notes-timeline">
        {notes.map((note) => (
          <div key={note.slug} className="yoyo-note-item">
            <time className="yoyo-note-time" dateTime={note.createdAt}>
              {formatNoteTime(note.createdAt)}
            </time>
            <p className="yoyo-note-text">{note.content}</p>
          </div>
        ))}
      </div>
      <Link href="/notes" className="yoyo-read-all">
        查看全部随感 →
      </Link>
    </Reveal>
  );
}

export async function NowSection() {
  const { items: nowItems } = await getNowItems();
  if (nowItems.length === 0) return null;
  return (
    <Reveal className="yoyo-section yoyo-content">
      <div className="yoyo-section-head">
        <h3 className="yoyo-section-title">NOW</h3>
      </div>
      <ul className="yoyo-now-list">
        {nowItems.map((item) => (
          <li key={item.label} className="yoyo-now-item">
            <span className="yoyo-now-label">{item.label}</span>
            <span className="yoyo-now-text">{item.text}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export function GithubSection() {
  return (
    <Reveal className="yoyo-section yoyo-content">
      <div className="yoyo-card yoyo-github-card">
        <div className="yoyo-github-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" /></svg>
          <span className="yoyo-github-username">
            @{siteConfig.githubUsername}
          </span>
        </div>
        <p className="yoyo-github-intro">开源项目与开发活动</p>
        <a
          href={githubUrl}
          className="yoyo-github-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit GitHub →
        </a>
      </div>
    </Reveal>
  );
}

export function AboutSection() {
  return (
    <Reveal className="yoyo-section yoyo-content">
      <div className="yoyo-section-head">
        <h3 className="yoyo-section-title">ABOUT</h3>
      </div>
      <p className="yoyo-about-text">
        执着yoyo
        是一个个人数字花园，记录开发实践、技术思考与生活随感。内容偏向前端工程与工具链，偶尔写一些与代码无关的东西。希望能在这里慢慢长出一些有用的东西。
      </p>
    </Reveal>
  );
}
