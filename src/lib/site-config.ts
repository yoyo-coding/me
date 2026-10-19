/**
 * 站点全局配置。
 *
 * ⚠️ 占位信息：以下 `TODO(replace)` 标记的值需要替换为真实信息，
 *    目前均来自设计稿示例或统一占位符，不应视为真实数据。
 */
export const siteConfig = {
  /** 站点名称 */
  name: "执着yoyo",
  /** 站点标题（浏览器标签页 / SEO） */
  title: "yoyo Blog",
  /** 站点描述（SEO / Open Graph） */
  description:
    "执着yoyo 的个人数字花园，记录开发实践、技术思考与生活随感。",
  /**
   * 生产环境站点地址（用于 canonical URL / sitemap / OG）。
   * TODO(replace): 部署后替换为真实域名，例如 https://yoyo.example.com
   */
  url: "https://yoyo-coding.github.io/me",
  /** 页脚标语（来自设计稿） */
  footerTagline: "yoyo",
  /**
   * GitHub 用户名。
   */
  githubUsername: "yoyo-coding",
  /**
   * 头像图片路径（public 目录下）。
   * GitHub Pages 部署在仓库子路径 /me 下，静态资源引用需要手动加 basePath
   * （Next 只自动处理 <Link> 与 next/image，不处理手写 src）。
   */
  avatar: process.env.NEXT_EXPORT === "1" ? "/me/avatar.png" : "/avatar.png",
  /** 语言与区域 */
  locale: "zh-CN",
} as const;

/** GitHub 主页链接 */
export const githubUrl = `https://github.com/${siteConfig.githubUsername}`;

/** 导航结构（严格遵循设计稿的 5 个导航项，不得擅自增减） */
export const navItems = [
  { key: "home", label: "Home", href: "/" },
  { key: "blog", label: "Blog", href: "/blog" },
  { key: "notes", label: "Notes", href: "/notes" },
  { key: "projects", label: "Projects", href: "/projects" },
  { key: "about", label: "About", href: "/about" },
] as const;

export type NavKey = (typeof navItems)[number]["key"];

/** 通过路径解析当前导航项（子路由如 /blog/xxx 归属于 /blog） */
export function resolveNavKey(pathname: string): NavKey | null {
  for (const item of navItems) {
    if (item.href === "/") {
      if (pathname === "/") return item.key;
    } else if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return item.key;
    }
  }
  return null;
}
