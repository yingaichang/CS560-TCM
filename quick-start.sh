#!/bin/bash
# Quick Start Script for YUAN TCM Clinic Website
# This script helps you get started quickly

echo "🌿 YUAN TCM 診所網站 - 快速啟動"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝。請從 https://nodejs.org 下載安裝。"
    exit 1
fi

echo "✅ Node.js 已安裝: $(node --version)"
echo "✅ npm 已安裝: $(npm --version)"
echo ""

# Check if in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ 錯誤：請確保在項目根目錄運行此腳本"
    exit 1
fi

echo "📦 第1步：安裝依賴..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ 依賴安裝完成"
else
    echo "❌ 依賴安裝失敗"
    exit 1
fi

echo ""
echo "⚙️  第2步：環境配置"
echo ""
echo "請確保已完成以下步驟："
echo "1. ✅ 已安裝 PostgreSQL"
echo "2. ✅ 已建立數據庫 'tcm_clinic'"
echo "3. ✅ 已編輯 .env.local 文件（複製自 .env.example）"
echo "4. ✅ 已設置 DATABASE_URL 變量"
echo ""

read -p "按 Enter 鍵繼續..." -n 1 -r

echo ""
echo "🗄️  第3步：初始化數據庫..."
npm run db:push

echo ""
echo "🚀 第4步：啟動開發服務器..."
echo "命令: npm run dev"
echo ""
echo "⏳ 請稍候，服務器啟動中..."
npm run dev
