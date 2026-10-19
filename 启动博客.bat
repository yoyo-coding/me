@echo off
chcp 65001 >nul
title yoyo blog

rem ============================================
rem yoyo blog 一键启动脚本
rem 双击运行：自动安装依赖（如有需要）并启动开发服务器
rem ============================================

cd /d "%~dp0"

echo.
echo [1/2] 检查依赖...
if not exist "node_modules\" (
    echo 未检测到 node_modules，正在安装依赖（使用 pnpm）...
    call pnpm install
    if errorlevel 1 (
        echo pnpm 不可用，尝试使用 npm...
        call npm install
        if errorlevel 1 (
            echo 依赖安装失败，请检查 Node.js 环境后重试。
            pause
            exit /b 1
        )
    )
) else (
    echo 依赖已就绪。
)

echo.
echo [2/2] 启动开发服务器...
echo 启动后将自动打开浏览器，按 Ctrl+C 可停止服务。
echo.

start "" http://localhost:3000
call pnpm dev
if errorlevel 1 (
    call npm run dev
)

pause
