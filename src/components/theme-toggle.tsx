/**
 * 主题系统：浅色 / 深色 / 跟随系统。
 *
 * 实现方式：
 * - 深色模式 = <html> 上的 `dark` class（与设计稿一致）。
 * - 用户选择持久化在 localStorage（key: yoyo-theme）。
 * - 首屏防闪烁：layout 中的内联脚本在渲染前同步设置 class。
 * - 切换按钮循环 light → dark → system，图标与 aria 状态由 CSS 驱动。
 */
"use client";

import { useCallback, useEffect, useState } from "react";

export const THEME_STORAGE_KEY = "yoyo-theme";

export type ThemeChoice = "light" | "dark" | "system";

/** 写入主题：choice=system 时移除覆盖并跟随系统，否则固定 light/dark */
export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  let dark: boolean;
  if (choice === "system") {
    root.removeAttribute("data-theme-pref");
    dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } else {
    root.setAttribute("data-theme-pref", choice);
    dark = choice === "dark";
  }
  root.classList.toggle("dark", dark);
  root.setAttribute("data-theme", dark ? "dark" : "light");
}

export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  // 初始化：读取已保存的选择
  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      setChoice(saved);
    }
  }, []);

  // 跟随系统主题变化（仅 system 模式下生效）
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = localStorage.getItem(THEME_STORAGE_KEY) ?? "system";
      if (current === "system") {
        applyTheme("system");
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const cycle = useCallback(() => {
    const next: ThemeChoice =
      choice === "light" ? "dark" : choice === "dark" ? "system" : "light";
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
    setChoice(next);
  }, [choice]);

  const label =
    choice === "light" ? "当前：浅色（点击切换为深色）"
    : choice === "dark" ? "当前：深色（点击切换为跟随系统）"
    : "当前：跟随系统（点击切换为浅色）";

  return (
    <button
      type="button"
      className="yoyo-theme-toggle"
      onClick={cycle}
      aria-label={`切换主题，${label}`}
      title={label}
      data-choice={choice}
    >
      <svg className="yoyo-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg className="yoyo-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      {/* system 模式指示点 */}
      <span className="yoyo-theme-system-dot" aria-hidden="true" />
    </button>
  );
}
