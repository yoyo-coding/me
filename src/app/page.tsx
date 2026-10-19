import { getAllBlogPosts, getAllNotes } from "@/lib/content";
import {
  AboutSection,
  BlogSection,
  GithubSection,
  Hero,
  NotesSection,
  NowSection,
  Welcome,
} from "@/components/home-sections";

/** 首页为静态生成（内容来自本地 markdown） */
export const dynamic = "force-static";

export default async function HomePage() {
  // 首页各板块最多取最近 3 条 Blog / 4 条 Note（与设计稿一致）
  const [posts, notes] = await Promise.all([
    getAllBlogPosts().then((all) => all.slice(0, 3)),
    getAllNotes().then((all) => all.slice(0, 4)),
  ]);

  return (
    <>
      <Hero />
      <Welcome />
      <BlogSection posts={posts} />
      <NotesSection notes={notes} />
      <NowSection />
      <GithubSection />
      <AboutSection />
    </>
  );
}
