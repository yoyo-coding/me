// scripts/build-export.mjs — 静态导出包装：临时移除 console API 动态路由
// （Next.js output:export 不支持 force-dynamic 的 route handler，
//  而 console API 只在本地 dev / node server 下使用，导出时需要移出构建。）
import { rename, mkdir, rm } from "fs/promises";
import { spawnSync } from "child_process";

const apiDir = "src/app/console/api";
const stash = ".next-export-stash/api";

await mkdir(".next-export-stash", { recursive: true }).catch(() => {});
await rm(stash, { recursive: true, force: true });
await rename(apiDir, stash);

let code = 1;
try {
  const r = spawnSync(process.platform === "win32" ? "next.cmd" : "next", ["build"], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, NEXT_EXPORT: "1" },
  });
  code = r.status ?? 1;
} finally {
  // 无论成功失败都还原 API 路由
  await rm(apiDir, { recursive: true, force: true }).catch(() => {});
  await rename(stash, apiDir).catch(() => {});
  if (code !== 0) process.exit(code);
}
console.log("static export done → out/");
