import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/content";
import { BlogList } from "@/components/blog-list";

export const metadata: Metadata = {
  title: "Blog",
  description: "文章与开发实践记录",
  alternates: {
    canonical: "/blog",
  },
};

export const dynamic = "force-static";

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <>
      <section className="yoyo-content yoyo-page-header">
        <h1 className="t-h2 yoyo-page-title">Blog</h1>
        <p className="t-body yoyo-page-desc">文章与开发实践记录</p>
      </section>
      <BlogList posts={posts} />
    </>
  );
}
