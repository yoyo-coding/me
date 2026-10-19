import type { Metadata } from "next";
import { githubUrl } from "@/lib/site-config";
import { getProjects } from "@/lib/site-data";
import { GithubIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Projects",
  description: "个人项目与开源贡献",
  alternates: {
    canonical: "/projects",
  },
};

export const dynamic = "force-static";

/** 项目卡片：优先仓库链接，其次项目主页（未提供的信息不编造） */
function projectHref(repositoryUrl?: string, url?: string): string | null {
  return repositoryUrl ?? url ?? null;
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <section className="yoyo-content yoyo-page-header">
        <h1 className="t-h2 yoyo-page-title">Projects</h1>
        <p className="t-body yoyo-page-desc">个人项目与开源贡献</p>
      </section>

      <section className="yoyo-content yoyo-section">
        {projects.length === 0 ? (
          <p className="yoyo-empty">项目整理中，稍后再来看看。</p>
        ) : (
          <div className="yoyo-project-grid">
            {projects.map((project) => {
              const href = projectHref(project.repositoryUrl, project.url);
              return (
                <article key={project.slug} className="yoyo-project-card">
                  <h3 className="yoyo-project-name">{project.name}</h3>
                  <p className="yoyo-project-desc">{project.description}</p>
                  <div className="yoyo-project-tags">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="yoyo-tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                  {href && (
                    <a
                      href={href}
                      className="yoyo-project-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.url && !project.repositoryUrl ? "访问项目" : "GitHub"} →
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="yoyo-content yoyo-section">
        <div className="yoyo-section-head">
          <h3 className="yoyo-section-title">GITHUB</h3>
        </div>
        <div className="yoyo-card yoyo-github-card">
          <div className="yoyo-github-header">
            <GithubIcon size={20} />
            <span className="yoyo-github-username">@yoyo-coding</span>
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
      </section>
    </>
  );
}
