"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navItems, siteConfig } from "@/lib/site-config";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * 常驻导航栏（毛玻璃、当前页高亮、移动端折叠菜单、主题切换）。
 * 结构与样式严格对应设计稿 project-shell 的 navbar。
 * 注意：/console 后台不设任何可视化入口，仅可通过手动输入网址访问。
 */
export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // 路由变化时自动收起移动端菜单
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const activeKey = (() => {
    for (const item of navItems) {
      if (item.href === "/") {
        if (pathname === "/") return item.key;
      } else if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return item.key;
      }
    }
    return null;
  })();

  return (
    <nav className="yoyo-nav">
      <div className="yoyo-nav-inner">
        <Link href="/" className="yoyo-nav-logo">
          <span className="yoyo-nav-logo-text">{siteConfig.name}</span>
        </Link>
        <div className="yoyo-nav-links">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="yoyo-nav-link"
              data-active={activeKey === item.key}
              aria-current={activeKey === item.key ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="yoyo-nav-actions">
          <ThemeToggle />
          <button
            type="button"
            className="yoyo-nav-menu-btn"
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={menuOpen}
            aria-controls="yoyo-nav-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div id="yoyo-nav-mobile-menu" className="yoyo-nav-mobile" hidden={!menuOpen}>
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="yoyo-nav-mobile-link"
            data-active={activeKey === item.key}
            aria-current={activeKey === item.key ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
