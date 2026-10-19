import Link from "next/link";
import { navItems, siteConfig, githubUrl } from "@/lib/site-config";
import { GithubIcon } from "@/components/icons";

/** 页脚：站名 + 标语 / GitHub + 申请友链 + Home + Blog + Notes */
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
            aria-label="GitHub"
          >
            <GithubIcon size={14} />
            GitHub
          </a>
          <Link href="/about#apply-friend" className="yoyo-footer-link">
            申请友链
          </Link>
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
