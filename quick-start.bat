@echo off
REM Quick Start Script for YUAN TCM Clinic Website - Windows Version
REM This script helps you get started quickly

setlocal enabledelayedexpansion

echo.
echo 🌿 YUAN TCM 診所網站 - 快速啟動
echo ==================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js 未安裝。請從 https://nodejs.org 下載安裝。
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i

echo ✅ Node.js 已安裝: %NODE_VER%
echo ✅ npm 已安裝: %NPM_VER%
echo.

REM Check if in the correct directory
if not exist package.json (
    echo ❌ 錯誤：請確保在項目根目錄運行此腳本
    pause
    exit /b 1
)

echo 📦 第1步：安裝依賴...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 依賴安裝失敗
    pause
    exit /b 1
)

echo ✅ 依賴安裝完成
echo.

echo ⚙️  第2步：環境配置
echo.
echo 請確保已完成以下步驟：
echo 1. ✅ 已安裝 PostgreSQL
echo 2. ✅ 已建立數據庫 'tcm_clinic'
echo 3. ✅ 已編輯 .env.local 文件 (複製自 .env.example)
echo 4. ✅ 已設置 DATABASE_URL 變量
echo.

pause

echo.
echo 🗄️  第3步：初始化數據庫...
call npm run db:push

echo.
echo 🚀 第4步：啟動開發服務器...
echo 命令: npm run dev
echo.
echo ⏳ 請稍候，服務器啟動中...
call npm run dev

pause
