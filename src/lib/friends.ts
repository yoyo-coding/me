/**
 * 友情链接数据层。
 *
 * 数据来源：github.com/yoyo-coding/friends-data 仓库的 data/friends/*.json，
 * 通过 jsDelivr CDN 读取（自动合并最新内容，纯静态站无需服务端）。
 * 拉取失败时回退为空列表，页面显示空态。
 */

export interface FriendLink {
  /** 站点名称 */
  name: string;
  /** 站点 URL */
  url: string;
  /** 头像 URL（可选） */
  avatar?: string;
  /** 一句话描述（可选） */
  description?: string;
  /** 申请者的回链页面（不用于展示，仅校验用） */
  backlink?: string;
}

const DATA_SOURCES = [
  // jsDelivr 会打包目录列表 API 与文件内容，且带 CDN 缓存
  "https://data.jsdelivr.com/v1/packages/gh/yoyo-coding/friends-data@main?structure=flat",
];

const CONTENT_BASE = "https://cdn.jsdelivr.net/gh/yoyo-coding/friends-data@main/";

interface JsDelivrFile {
  name: string;
  type: string;
}

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** 获取全部友链（构建时执行；任何失败回退空数组） */
export async function getFriendLinks(): Promise<FriendLink[]> {
  const listing = await fetchJson<{ files: JsDelivrFile[] }>(DATA_SOURCES[0]!);
  if (!listing?.files) return [];

  const jsonFiles = listing.files
    .filter((f) => f.type === "file" && f.name.endsWith(".json"))
    .map((f) => f.name);

  const friends = await Promise.all(
    jsonFiles.map(async (name): Promise<FriendLink | null> => {
      const data = await fetchJson<Partial<FriendLink>>(`${CONTENT_BASE}${name}`);
      if (!data || typeof data.name !== "string" || typeof data.url !== "string") return null;
      return {
        name: data.name,
        url: data.url,
        avatar: typeof data.avatar === "string" ? data.avatar : undefined,
        description: typeof data.description === "string" ? data.description : undefined,
      };
    }),
  );

  return friends.filter((f): f is FriendLink => f !== null);
}
