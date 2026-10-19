"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * 滚动渐入容器。
 * - 仅在 html.js（JS 可用）时应用隐藏样式，无 JS 时内容直接可见；
 * - IntersectionObserver 触发一次后即取消观察，不做持续监听；
 * - prefers-reduced-motion 下 CSS 已禁用动画。
 */
export function Reveal({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div";
}) {
  const ref = useRef<HTMLElement | null>(null);

  // 回调 ref：同时兼容 <div> 与 <section> 的 ref 参数类型
  const setRef = useCallback((node: HTMLElement | null) => {
    ref.current = node;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={setRef} className={`yoyo-reveal ${className}`.trim()}>
      {children}
    </Tag>
  );
}
