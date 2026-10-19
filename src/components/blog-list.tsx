"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BlogPost } from "@/lib/types";
import { formatDate } from "@/lib/format";

const PAGE_SIZE = 5;

/**
 * Blog 列表：标签过滤 + 加载更多分页。
 * 过滤为纯客户端行为（内容量小），保持无状态路由简洁。
 */
export function BlogList({ posts }: { posts: BlogPost[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh"));
  }, [posts]);

  const filtered = useMemo(
    () => (activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts),
    [posts, activeTag],
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const selectTag = (tag: string | null) => {
    setActiveTag(tag);
    setVisibleCount(PAGE_SIZE);
  };

  if (posts.length === 0) {
    return (
      <p className="yoyo-content yoyo-empty">还没有文章。内容会在这里慢慢生长。</p>
    );
  }

  return (
    <>
      {tags.length > 0 && (
        <section className="yoyo-content" style={{ paddingBottom: 32 }}>
          <div className="yoyo-filter-bar">
            <button
              type="button"
              className="yoyo-tag"
              data-active={activeTag === null}
              onClick={() => selectTag(null)}
            >
              全部
            </button>
            {tags.map(([tag]) => (
              <button
                key={tag}
                type="button"
                className="yoyo-tag"
                data-active={activeTag === tag}
                aria-pressed={activeTag === tag}
                onClick={() => selectTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="yoyo-content" style={{ paddingBottom: 32 }}>
        {visible.length === 0 ? (
          <p className="yoyo-empty">该标签下暂无文章。</p>
        ) : (
          <div className="yoyo-blog-list">
            {visible.map((post, index) => (
              <article
                key={post.slug}
                className={index === 0 && activeTag === null ? "yoyo-blog-featured" : "yoyo-blog-plain"}
              >
                <Link href={`/blog/${post.slug}`} className="yoyo-blog-title">
                  {post.title}
                </Link>
                <p className="yoyo-blog-excerpt">{post.description}</p>
                <div className="yoyo-blog-meta">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  {post.tags.map((tag) => (
                    <span key={tag} className="yoyo-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="yoyo-load-more">
            <button
              type="button"
              className="yoyo-load-more-btn"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              加载更多 →
            </button>
          </div>
        )}
      </section>
    </>
  );
}
