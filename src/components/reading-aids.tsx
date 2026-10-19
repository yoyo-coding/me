"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 阅读辅助：
 * - 顶部阅读进度条（rAF 节流的 scroll 监听）；
 * - 代码块复制按钮（事件委托 + Clipboard API，带成功/失败反馈）。
 * 在博客详情页挂载一次。
 */
export function ReadingAids() {
  const barRef = useRef<HTMLDivElement | null>(null);
  const [hasCodeBlocks, setHasCodeBlocks] = useState(false);

  // 阅读进度条
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      bar.style.transform = `scaleX(${progress})`;
      bar.style.visibility = progress > 0.005 ? "visible" : "hidden";
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // 代码复制（事件委托到正文容器）
  useEffect(() => {
    const prose = document.querySelector<HTMLElement>(".yoyo-prose");
    if (!prose) return;
    const buttons = prose.querySelectorAll<HTMLButtonElement>(".yoyo-copy-btn");
    if (buttons.length === 0) return;
    setHasCodeBlocks(true);

    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    const onClick = async (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".yoyo-copy-btn");
      if (!button) return;
      const code = button.parentElement?.querySelector("pre code");
      if (!code) return;
      const text = code.textContent ?? "";
      try {
        await navigator.clipboard.writeText(text);
        button.dataset.copied = "true";
        button.setAttribute("aria-label", "已复制");
        const feedback = button.querySelector(".yoyo-copy-feedback");
        if (feedback) feedback.textContent = "已复制";
      } catch {
        button.dataset.copied = "false";
        button.setAttribute("aria-label", "复制失败");
        const feedback = button.querySelector(".yoyo-copy-feedback");
        if (feedback) feedback.textContent = "复制失败";
      } finally {
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          delete button.dataset.copied;
          button.setAttribute("aria-label", "复制代码");
          const feedback = button.querySelector(".yoyo-copy-feedback");
          if (feedback) feedback.textContent = "";
        }, 2000);
      }
    };

    prose.addEventListener("click", onClick);
    return () => {
      prose.removeEventListener("click", onClick);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="yoyo-reading-progress"
      style={{ visibility: "hidden" }}
      aria-hidden={hasCodeBlocks ? undefined : true}
      role="progressbar"
      aria-label="阅读进度"
    >
      <span className="yoyo-visually-hidden">阅读进度条</span>
    </div>
  );
}
