import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBlogPosts, getBlogPost, estimateReadingTime } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { ReadingAids } from "@/components/reading-aids";
import { TableOfContents } from "@/components/toc";

export const dynamic = "force-static";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

/** 静态生成所有文章路由 */
export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBlogPost(slug);
  if (!result) {
    return { title: "文章不存在" };
  }
  const { post } = result;
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const result = await getBlogPost(slug);
  if (!result) {
    notFound();
  }
  const { post, html } = result;
  const readingTime = post.readingTime ?? estimateReadingTime(html.replace(/<[^>]*>/g, " "));

  // 相关文章：同标签优先，按时间取最近 2 篇（排除当前文章）
  const allPosts = await getAllBlogPosts();
  const related = allPosts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      const aOverlap = a.tags.filter((t) => post.tags.includes(t)).length;
      const bOverlap = b.tags.filter((t) => post.tags.includes(t)).length;
      return bOverlap - aOverlap || b.publishedAt.localeCompare(a.publishedAt);
    })
    .slice(0, 2);

  return (
    <>
      <ReadingAids />
      <div className="yoyo-post-layout">
        <article className="yoyo-post">
          <header className="yoyo-post-header">
            <h1 className="yoyo-post-title">{post.title}</h1>
            {post.description && <p className="yoyo-post-desc">{post.description}</p>}
            <div className="yoyo-blog-meta">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              {post.updatedAt && post.updatedAt !== post.publishedAt && (
                <span className="yoyo-post-updated">
                  更新于 {formatDate(post.updatedAt)}
                </span>
              )}
              <span aria-label={`预计阅读 ${readingTime} 分钟`}>
                {readingTime} 分钟阅读
              </span>
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} className="yoyo-tag">
                  {tag}
                </Link>
              ))}
            </div>
          </header>

          {/* 渲染后的 Markdown 正文（rehype 管线输出，含锚点与代码高亮） */}
          <div className="yoyo-prose" dangerouslySetInnerHTML={{ __html: html }} />

          <footer className="yoyo-post-footer">
            <Link href="/blog" className="yoyo-read-all">
              ← 返回全部文章
            </Link>
          </footer>
        </article>

        {/* 桌面端目录（移动端隐藏） */}
        <TableOfContents html={html} />
      </div>

      {related.length > 0 && (
        <section className="yoyo-content yoyo-section" aria-labelledby="related-heading">
          <div className="yoyo-section-head">
            <h3 id="related-heading" className="yoyo-section-title">
              相关文章
            </h3>
          </div>
          <div className="yoyo-blog-list">
            {related.map((item) => (
              <article key={item.slug} className="yoyo-blog-plain">
                <Link href={`/blog/${item.slug}`} className="yoyo-blog-title">
                  {item.title}
                </Link>
                <p className="yoyo-blog-excerpt">{item.description}</p>
                <div className="yoyo-blog-meta">
                  <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
