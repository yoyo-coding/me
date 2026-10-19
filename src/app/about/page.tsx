import type { Metadata } from "next";
import { githubUrl } from "@/lib/site-config";
import { getAbout } from "@/lib/site-data";
import { GithubIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About",
  description: "关于执着yoyo：个人数字花园的介绍、关注的技术与网站理念。",
  alternates: {
    canonical: "/about",
  },
};

/** 内容来自 content/about.json，可在 /console 后台编辑；文件缺失时回退内置默认值 */
export default async function AboutPage() {
  const about = await getAbout();
  return (
    <Reveal as="div" className="yoyo-about-layout">
      <h1 className="yoyo-about-heading">About</h1>

      <section className="yoyo-about-section">
        {about.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 12)} className="yoyo-about-text-muted">
            {paragraph}
          </p>
        ))}
      </section>

      <section className="yoyo-about-section">
        <h2 className="yoyo-about-label">关注的技术</h2>
        <div className="yoyo-about-tags">
          {about.techTags.map((tech) => (
            <span key={tech} className="yoyo-tag">
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section className="yoyo-about-section">
        <h2 className="yoyo-about-label">兴趣方向</h2>
        <p className="yoyo-about-text-muted">{about.interests}</p>
      </section>

      <section className="yoyo-about-section">
        <h2 className="yoyo-about-label">网站理念</h2>
        <p className="yoyo-about-text-muted">{about.philosophy}</p>
      </section>

      <section className="yoyo-about-section">
        <h2 className="yoyo-about-label">链接</h2>
        <a
          href={githubUrl}
          className="yoyo-about-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubIcon size={16} />
          GitHub
        </a>
      </section>
    </Reveal>
  );
}
