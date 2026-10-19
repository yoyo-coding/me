"use client";

import { useEffect, useState } from "react";
import type { ElementContent } from "hast";

interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** 从 hast 树提取 h2/h3 构建 TOC（与 rehype-slug 生成的 id 对齐） */
export function extractHeadings(children: ElementContent[]): TocHeading[] {
  const headings: TocHeading[] = [];
  const walk = (nodes: ElementContent[]) => {
    for (const node of nodes) {
      if (node.type !== "element") continue;
      if (node.tagName === "h2" || node.tagName === "h3") {
        const id = node.properties?.id;
        if (typeof id === "string") {
          const text = textOf(node);
          if (text) headings.push({ id, text, level: node.tagName === "h2" ? 2 : 3 });
        }
      }
      walk(node.children);
    }
  };
  walk(children);
  return headings;
}

function textOf(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(textOf).join("");
  return "";
}

/**
 * 桌面端文章目录（侧边悬浮，移动端隐藏以不挤压正文）。
 * 当前阅读位置的标题高亮，用 IntersectionObserver 实现，无滚动监听。
 */
export function TableOfContents({ html }: { html: string }) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 从渲染后的 DOM 读取标题（服务端 HTML 水合后解析，避免重复实现 hast 遍历）
  useEffect(() => {
    const prose = document.querySelector(".yoyo-prose");
    if (!prose) return;
    const nodes = prose.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]");
    const items: TocHeading[] = [];
    nodes.forEach((node) => {
      const id = node.id;
      const text = node.textContent?.trim() ?? "";
      if (id && text) items.push({ id, text, level: node.tagName === "H2" ? 2 : 3 });
    });
    setHeadings(items);
  }, [html]);

  // 当前小节高亮
  useEffect(() => {
    if (headings.length === 0) return;
    const targets = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 取视口最上方附近的标题作为当前小节
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-72px 0px -66% 0px", threshold: 0 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="yoyo-toc" aria-label="文章目录">
      <p className="yoyo-toc-title">目录</p>
      <ul>
        {headings.map((heading) => (
          <li key={heading.id} data-level={heading.level}>
            <a
              href={`#${heading.id}`}
              className="yoyo-toc-link"
              data-active={activeId === heading.id}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
