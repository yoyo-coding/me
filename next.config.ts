import type { NextConfig } from "next";

/**
 * 站点部署到 GitHub Pages，仓库 me → 访问路径 https://<user>.github.io/me/
 * 因此需要：
 *  1. output: "export" 纯静态导出（Pages 不支持 Node 服务端）
 *  2. basePath /me、assetPrefix /me 让资源与链接都带仓库子路径
 * 本地 dev 时设置了环境变量 NEXT_PUBLIC_BASE_PATH=（空）即可去掉子路径。
 */
const isExport = process.env.NEXT_EXPORT === "1";

const repoName = "me";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isExport
    ? {
        output: "export" as const,
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
        // trailingSlash 让 /blog/foo/ 形式在 Pages 上正确映射到 /blog/foo/index.html
        trailingSlash: true,
        // 纯静态导出禁用会调用 Node 服务端的图片优化
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
