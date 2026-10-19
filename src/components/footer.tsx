import Link from "next/link";
import { githubUrl, navItems, siteConfig } from "@/lib/site-config";

/** 页脚（严格对应设计稿 project-shell 的 footer：站名 + 标语 / GitHub + Home + Blog + Notes） */
export function Footer() {
  const footerLinks = navItems.filter((item) =>
    ["home", "blog", "notes"].includes(item.key),
  );

  return (
    <footer className="yoyo-footer">
      <div className="yoyo-footer-inner">
        <div className="yoyo-footer-left">
          <span className="yoyo-footer-name">{siteConfig.name}</span>
          <span className="yoyo-footer-copy">
            © {new Date().getFullYear()} · {siteConfig.footerTagline}
          </span>
        </div>
        <div className="yoyo-footer-links">
          <a
            href={githubUrl}
            className="yoyo-footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" /></svg>
            GitHub
          </a>
          {footerLinks.map((item) => (
            <Link key={item.key} href={item.href} className="yoyo-footer-link">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
