import Link from "next/link";
import type { BlogPost, Note } from "@/lib/types";
import { siteConfig } from "@/lib/site-config";
import { getNowItems } from "@/lib/site-data";
import { formatDate, formatNoteTime } from "@/lib/format";
import { Reveal } from "@/components/reveal";

/* ============================================================
   首页各内容板块（设计稿：首页.html）
   首屏（hero）仅头像，滚动后依次：欢迎语 → Blog → Notes → Now → About
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
