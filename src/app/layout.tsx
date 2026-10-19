import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/site-config";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { WaveBackground } from "@/components/wave-background";
import "./globals.css";
import "@/styles/layout.css";
import "@/styles/home.css";
import "@/styles/post.css";
import "@/styles/about.css";
import "@/styles/projects.css";
import "@/styles/console.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["执着yoyo", "数字花园", "个人博客", "前端工程", "技术随笔"],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FBFC" },
    { media: "(prefers-color-scheme: dark)", color: "#101923" },
  ],
};

/**
 * 首屏防闪烁主题脚本：
 * 在页面渲染前根据 localStorage / 系统偏好同步设置 html.dark。
 * setAttribute 调用仅为与设计稿 data-theme 标记保持一致。
 */
const themeInitScript = `(function(){try{var k='yoyo-theme';var p=localStorage.getItem(k)||'system';var d=p==='dark'||(p!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d){r.classList.add('dark');}r.setAttribute('data-theme',d?'dark':'light');r.setAttribute('data-theme-pref',p);}catch(e){}})();`;

/** 标记 JS 可用，滚动渐入效果仅在 html.js 下启用（无 JS 时内容直接可见） */
const jsMarkerScript = 'document.documentElement.classList.add("js");';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: jsMarkerScript }} />
      </head>
      <body>
        <a href="#main" className="yoyo-skip-link">
          跳转到主要内容
        </a>
        <WaveBackground />
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
