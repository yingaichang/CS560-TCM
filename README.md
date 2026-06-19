# YUAN 中醫診所 - TCM Clinic Website

高質感的中醫診所官方網站，結合傳統中醫智慧與現代科技。

## 🌿 特色功能

- **響應式設計** - 完美適配桌面、平板和手機設備
- **現代化UI** - 傳統中國風美學與現代設計的完美結合
- **AI體質分析** - 智能化診療服務展示
- **線上預約系統** - 患者可直接線上預約診療
- **聯絡表單** - 方便患者與診所溝通
- **健康專欄** - 定期更新中醫養生知識
- **Google登入** - 隱蔽式Google登入選項（可選）

## 🛠️ 技術棧

- **Next.js 15** - 現代化React框架
- **TypeScript** - 類型安全的開發
- **Tailwind CSS** - 原子化CSS框架
- **PostgreSQL** - 關係型數據庫
- **Prisma ORM** - 數據庫操作工具
- **React Hook Form** - 表單狀態管理

## 📋 頁面結構

1. **首頁（Hero Banner）** - 吸引人的開場頁面
2. **關於診所** - 診所介紹與理念
3. **診療服務** - 4個主要服務卡片
4. **醫師團隊** - 專業醫師介紹
5. **健康專欄** - 4篇健康知識文章
6. **預約系統** - 線上預約表單
7. **聯絡信息** - 地址、電話、營業時間與聯絡表單

## 🚀 快速開始

### 前置條件

- Node.js 18+
- PostgreSQL 12+
- npm 或 yarn

### 安裝步驟

1. **複製倉庫**
```bash
git clone <repository-url>
cd tcm-clinic-site
```

2. **安裝依賴**
```bash
npm install
```

3. **環境配置**
```bash
cp .env.example .env.local
```

編輯 `.env.local` 文件，設置以下變量：
```
DATABASE_URL="postgresql://user:password@localhost:5432/tcm_clinic"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **數據庫設置**
```bash
npm run db:push
```

5. **開發服務器**
```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000)

## 📦 項目結構

```
tcmSite/
├── src/
│   ├── app/
│   │   ├── api/              # API路由
│   │   ├── layout.tsx        # 根布局
│   │   └── page.tsx          # 首頁
│   ├── components/           # React組件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroBanner.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── TeamSection.tsx
│   │   ├── ArticlesSection.tsx
│   │   ├── AppointmentForm.tsx
│   │   └── ContactSection.tsx
│   ├── styles/
│   │   └── globals.css       # 全局樣式
│   └── lib/                  # 工具函數
├── prisma/
│   └── schema.prisma         # 數據庫schema
├── public/                   # 靜態資源
└── package.json
```

## 🗄️ 數據庫模型

### Appointment（預約）
- id: 預約ID
- name: 患者姓名
- email: 電郵地址
- phone: 電話號碼
- date: 預約日期
- service: 選擇的服務
- message: 備註訊息
- status: 預約狀態
- createdAt: 創建時間
- updatedAt: 更新時間

### Contact（聯絡）
- id: 聯絡ID
- name: 聯絡人姓名
- email: 電郵地址
- subject: 主旨
- message: 訊息內容
- status: 處理狀態
- createdAt: 創建時間

### Doctor（醫師）
- id: 醫師ID
- name: 醫師姓名
- title: 職位
- specialty: 專科
- bio: 簡介
- experience: 經驗
- imageUrl: 照片URL

### HealthArticle（健康文章）
- id: 文章ID
- title: 標題
- excerpt: 摘要
- content: 內容
- category: 分類
- imageUrl: 圖片URL
- published: 發佈狀態

## 🎨 設計色彩系統

- **主綠色**: `#4a7c59` (tcm-green)
- **淺綠色**: `#6ba876` (tcm-light-green)
- **米色**: `#e8dcc8` (tcm-beige)
- **深色**: `#2d3436` (tcm-dark)
- **金色**: `#c9a961` (tcm-gold)

## 📱 響應式設計斷點

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔧 常用命令

```bash
# 開發
npm run dev

# 構建
npm run build

# 運行生產版本
npm start

# 推送數據庫更改
npm run db:push

# 打開Prisma Studio（數據庫可視化）
npm run db:studio

# 檢查代碼
npm run lint
```

## 🔐 安全性注意事項

1. **環境變量** - 絕不提交 `.env.local` 到版本控制
2. **Google OAuth** - 配置正確的重定向URI
3. **數據庫** - 使用強密碼和SSL連接
4. **API驗證** - 建議添加API認證機制
5. **CORS** - 配置適當的跨域策略

## 📝 自訂化指南

### 替換品牌資訊
1. 修改 `src/components/Header.tsx` 中的診所名稱
2. 修改 `src/components/Footer.tsx` 中的聯絡信息
3. 更新 `tailwind.config.ts` 中的色彩方案

### 添加醫師
編輯 `src/components/TeamSection.tsx` 中的 `doctors` 數組

### 添加服務
編輯 `src/components/ServicesSection.tsx` 中的 `services` 數組

### 添加文章
編輯 `src/components/ArticlesSection.tsx` 中的 `articles` 數組

## 🚀 部署指南

### Vercel 部署（推薦）
```bash
npm install -g vercel
vercel
```

### 其他平台
1. 構建項目：`npm run build`
2. 配置環境變量
3. 連接數據庫
4. 運行：`npm start`

## 📚 其他資源

- [Next.js 文檔](https://nextjs.org/docs)
- [Tailwind CSS 文檔](https://tailwindcss.com/docs)
- [Prisma 文檔](https://www.prisma.io/docs/)
- [PostgreSQL 文檔](https://www.postgresql.org/docs/)

## 📧 支援與聯絡

如有任何問題或建議，請通過以下方式聯絡：
- 電郵: info@yuanclinic.com.tw
- 電話: (02) 2567-8901

## 📄 授權

此項目採用 MIT 授權。詳見 LICENSE 文件。

---

**最後更新**: 2024年6月18日
