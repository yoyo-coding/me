"use client";

// React 客户端组件：必须使用 "use client" 标记，
// 因为本组件使用了 useEffect / useRef 等浏览器端 Hook。

import { useEffect, useRef } from "react";

/**
 * 首页背景波浪效果组件（模仿 thinkreally114.github.io/website）
 *
 * 实现思路：
 * - 渲染一个全屏、固定定位的 <canvas>（样式类 yoyo-wave-canvas，在全局 CSS 中定义）。
 * - 通过 requestAnimationFrame 循环重绘，每帧时间步 t 自增 1，驱动波浪缓慢流动。
 * - 绘制 4 条相互错开相位的复合正弦波曲线，叠加 3 个不同频率/速度的正弦分量，
 *   使波形看起来自然、有层次。
 * - 配色随主题自适应：
 *     - 亮色主题：半透明黑色线条（rgba(0,0,0,0.06)）
 *     - 暗色主题：半透明白色线条（rgba(255,255,255,0.08)）
 *   主题判断优先看 <html> 上的 class（手动切换的 dark/light），
 *   否则回退到系统的 prefers-color-scheme。
 * - 支持高分屏（devicePixelRatio），按 DPR 放大 canvas 实际像素并用
 *   setTransform 缩放绘制上下文，保证线条清晰。
 * - 无障碍/可用性：
 *     - canvas 设置 aria-hidden="true"，对屏幕阅读器隐藏。
 *     - 用户开启"减少动态效果"（prefers-reduced-motion: reduce）时，
 *       直接不启动动画，保持静态背景。
 *
 * 生命周期与清理：
 * - useEffect 只在挂载时运行一次（依赖数组为空）。
 * - 卸载时取消动画帧并移除 resize 监听器，避免内存泄漏。
 *
 * @returns 一个全屏固定的装饰性 canvas 元素
 */
export function WaveBackground() {
  // 持有 canvas DOM 元素的引用，供 useEffect 中获取 2D 绘制上下文
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // 获取 canvas 元素及其 2D 渲染上下文；任一不存在则直接退出
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 尊重系统的"减少动态"偏好：开启时跳过动画，保持静态
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // 逻辑尺寸（CSS 像素），在 resize 时更新
    let width = 0;
    let height = 0;
    // requestAnimationFrame 返回的句柄，用于卸载时取消动画
    let raf = 0;
    // 动画时间步，每帧 +1，作为正弦函数的时间偏移
    let t = 0;

    /**
     * 根据窗口大小和设备像素比（DPR）调整 canvas 尺寸。
     * canvas 的实际像素尺寸 = CSS 尺寸 × DPR，保证高分屏下线条锐利；
     * 同时通过 setTransform 让后续绘制仍使用 CSS 像素坐标。
     */
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    /**
     * 每帧绘制函数：
     * 1. 清空画布；
     * 2. 检测当前是否为暗色主题，选择对应线条颜色；
     * 3. 绘制 4 条相位错开的复合正弦波；
     * 4. 时间步 t 自增，安排下一帧。
     */
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 主题检测：优先取 <html> 上手动设置的 class（dark/light），
      // 若都未设置则回退到系统偏好 prefers-color-scheme
      const isDark =
        document.documentElement.classList.contains("dark") ||
        (!document.documentElement.classList.contains("light") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      // 线条样式：极低透明度，作为若隐若现的背景装饰
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
      ctx.lineWidth = 1.5;

      // 绘制 4 条波浪；i 作为索引，为每条波提供不同的相位偏移
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        // 以 2px 为步长采样 x 坐标，逐点计算 y 并连线成曲线
        for (let x = 0; x <= width; x += 2) {
          // y 是 3 个正弦分量的叠加，围绕垂直中线（height * 0.5）摆动：
          // - 分量 1：频率 0.008、速度 0.02，主波，振幅 12% 屏高
          // - 分量 2：频率 0.015、速度 0.03，中波，振幅 6% 屏高
          // - 分量 3：频率 0.003、速度 0.01，慢速大起伏，振幅 8% 屏高
          // i * 系数：让每条波在空间和时间上错开，形成层次感
          const y =
            height * 0.5 +
            Math.sin(x * 0.008 + t * 0.02 + i * 1.2) * height * 0.12 +
            Math.sin(x * 0.015 + t * 0.03 + i * 0.8) * height * 0.06 +
            Math.sin(x * 0.003 + t * 0.01 + i * 2) * height * 0.08;
          if (x === 0) ctx.moveTo(x, y); // 第一个点用 moveTo 起笔
          else ctx.lineTo(x, y);         // 后续点用 lineTo 连线
        }
        ctx.stroke();
      }

      // 推进时间步，并请求下一帧，形成循环动画
      t += 1;
      raf = requestAnimationFrame(draw);
    };
    // 启动动画循环
    draw();

    // 卸载清理：停止动画、移除监听，防止内存泄漏
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // 全屏固定的装饰性 canvas，对辅助技术隐藏
  return <canvas ref={canvasRef} className="yoyo-wave-canvas" aria-hidden="true" />;
}
