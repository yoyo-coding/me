/** Blog 文章数据模型（与说明书 7.1 一致） */
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category?: string;
  tags: string[];
  draft?: boolean;
  readingTime?: number;
  coverImage?: string;
}

/** Note 随感数据模型（与说明书 7.2 一致） */
export interface Note {
  slug: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  draft?: boolean;
}

/** Project 项目数据模型（与说明书 7.5 一致） */
export interface Project {
  slug: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  repositoryUrl?: string;
  featured?: boolean;
}

/** Now 当前状态条目（首页展示，数据来自 content/now.ts） */
export interface NowItem {
  label: string;
  text: string;
}

/** Blog 文章 + 渲染后正文的组合（详情页使用） */
export interface BlogPostWithContent extends BlogPost {
  /** 渲染后的 HTML 正文 */
  html: string;
}
