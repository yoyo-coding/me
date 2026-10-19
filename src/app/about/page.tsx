import type { Metadata } from "next";
import { getAbout } from "@/lib/site-data";
import { FriendLinksSection } from "@/components/friend-links";
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
        <h2 className="yoyo-about-label">友情链接</h2>
        <FriendLinksSection />
      </section>

      <FriendApplySection />
    </Reveal>
  );
}

/** 自动友链申请方式（页脚「申请友链」锚点目标，参考 blog.520pro.top/links 的做法） */
function FriendApplySection() {
  const repoUrl = "https://github.com/yoyo-coding/friends-data";
  return (
    <section id="apply-friend" className="yoyo-about-section yoyo-friend-apply-section">
      <h2 className="yoyo-about-label">如何申请友链</h2>
      <p className="yoyo-about-text-muted">
        本站友链完全自动化：Fork{" "}
        <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="yoyo-friend-apply-link">
          yoyo-coding/friends-data
        </a>{" "}
        数据仓库，在 <code className="yoyo-friend-code">data/friends/</code> 下添加一个 JSON 文件并提交
        Pull Request。机器人会自动校验格式与双向链接，通过后自动合并上线，无需等待人工审核。
      </p>
      <ol className="yoyo-friend-steps">
        <li>打开数据仓库的 <code className="yoyo-friend-code">data/friends</code> 目录</li>
        <li>点 <strong>Create new file</strong>，文件名以 <code className="yoyo-friend-code">.json</code> 结尾</li>
        <li>粘贴下方模板并替换成你的信息（<code className="yoyo-friend-code">backlink</code> 必填，用于双向链接验证）</li>
        <li>提交 Pull Request，自动校验通过后即上线</li>
      </ol>
      <pre className="yoyo-friend-template">{`{
  "name": "你的站点名称",
  "avatar": "https://你的头像URL（可选）",
  "description": "简短描述（可选）",
  "url": "https://你的网站URL",
  "backlink": "https://你的网站/友链页（必填）"
}`}</pre>
      <p className="yoyo-about-text-muted">
        请先在你的友链页添加指向本站（
        <code className="yoyo-friend-code">https://yoyo-coding.github.io/me</code>
        ）的链接，否则双向验证不会通过。
      </p>
    </section>
  );
}
