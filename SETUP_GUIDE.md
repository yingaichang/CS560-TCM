# 🚀 YUAN TCM 診所網站 - 設置指南

## 📌 項目總覽

您已成功創建一個完整的 Next.js + Tailwind CSS + PostgreSQL TCM 診所網站。該項目包含所有必需的組件、API 路由和數據庫配置。

## 📊 項目文件結構

```
tcmSite/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/
│   │   │   ├── appointments/route.ts # 預約API
│   │   │   └── contact/route.ts      # 聯絡表單API
│   │   ├── layout.tsx                # 根布局
│   │   └── page.tsx                  # 首頁
│   │
│   ├── components/                   # React組件
│   │   ├── Header.tsx                # 導航欄
│   │   ├── Footer.tsx                # 頁腳
│   │   ├── HeroBanner.tsx            # 英雄區域
│   │   ├── AboutSection.tsx          # 關於診所
│   │   ├── ServicesSection.tsx       # 診療服務
│   │   ├── TeamSection.tsx           # 醫師團隊
│   │   ├── ArticlesSection.tsx       # 健康專欄
│   │   ├── AppointmentForm.tsx       # 預約表單
│   │   └── ContactSection.tsx        # 聯絡區域
│   │
│   └── styles/
│       └── globals.css               # 全局樣式
│
├── prisma/
│   ├── schema.prisma                 # 數據庫模型
│   └── seed.ts                       # 數據庫種子數據
│
├── public/                           # 靜態資源文件夾
├── .env.example                      # 環境變量示例
├── .env.local                        # 本地環境變量（開發用）
├── .gitignore                        # Git 忽略文件
├── next.config.js                    # Next.js 配置
├── tailwind.config.ts                # Tailwind CSS 配置
├── tsconfig.json                     # TypeScript 配置
├── postcss.config.js                 # PostCSS 配置
├── package.json                      # 項目依賴
└── README.md                         # 項目文檔
```

## 🔧 前置條件

在開始設置之前，請確保已安裝：

- **Node.js** 18.17 或更高版本 ([https://nodejs.org](https://nodejs.org))
- **npm** 9+ 或 **yarn** ([隨Node.js自動安裝](https://nodejs.org))
- **PostgreSQL** 12+ ([https://www.postgresql.org](https://www.postgresql.org))
- **Git** ([https://git-scm.com](https://git-scm.com))

## 📦 安裝步驟

### 步驟 1：檢查 Node.js 版本

```bash
node --version
npm --version
```

確保版本符合要求。

### 步驟 2：安裝項目依賴

在項目根目錄運行：

```bash
npm install
```

或使用 yarn：

```bash
yarn install
```

這將安裝所有必要的依賴，包括：
- Next.js
- React & React DOM
- Tailwind CSS
- Prisma
- TypeScript
- 以及其他相關包

### 步驟 3：設置 PostgreSQL 數據庫

#### 選項 A：本地 PostgreSQL（推薦開發環境）

1. **安裝 PostgreSQL**
   - Windows: 下載安裝程序 [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: 使用 Homebrew: `brew install postgresql`
   - Linux: 使用包管理器: `sudo apt-get install postgresql`

2. **啟動 PostgreSQL 服務**
   - Windows: 服務應自動啟動
   - macOS/Linux: `brew services start postgresql` 或 `sudo service postgresql start`

3. **創建數據庫和用戶**

```bash
# 連接到 PostgreSQL
psql -U postgres

# 在 PostgreSQL 命令行中運行：
CREATE USER tcm_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE tcm_clinic OWNER tcm_user;
GRANT ALL PRIVILEGES ON DATABASE tcm_clinic TO tcm_user;
\q
```

#### 選項 B：使用 Docker（推薦）

如果已安裝 Docker，可以運行：

```bash
docker run --name postgres-tcm \
  -e POSTGRES_USER=tcm_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=tcm_clinic \
  -p 5432:5432 \
  -d postgres:15
```

### 步驟 4：配置環境變量

1. **編輯 `.env.local` 文件**（已為您創建）

```bash
# 編輯項目根目錄的 .env.local 文件
```

2. **設置數據庫連接字符串**

```env
DATABASE_URL="postgresql://tcm_user:your_secure_password@localhost:5432/tcm_clinic"
```

3. **生成安全密鑰**

```bash
# 在終端運行此命令生成密鑰
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. **更新 NEXTAUTH_SECRET**

```env
NEXTAUTH_SECRET="<粘貼上面生成的密鑰>"
```

5. **Google OAuth 設置（可選）**

如果想要 Google 登入功能：

1. 轉到 [Google Cloud Console](https://console.cloud.google.com)
2. 創建新項目
3. 啟用 Google+ API
4. 創建 OAuth 2.0 認證信息（Web 應用）
5. 設置重定向 URI：`http://localhost:3000/api/auth/callback/google`
6. 複製 Client ID 和 Client Secret 到 `.env.local`：

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 步驟 5：初始化數據庫

運行 Prisma 遷移來創建數據庫表：

```bash
npm run db:push
```

### 步驟 6：（可選）添加示例數據

運行種子腳本添加示例醫師和文章：

```bash
npx prisma db seed
```

## 🚀 啟動開發服務器

在項目根目錄運行：

```bash
npm run dev
```

輸出應該顯示：

```
  ▲ Next.js 15.0.0
  - ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

## 📖 訪問應用

在瀏覽器中打開 [http://localhost:3000](http://localhost:3000)

您應該看到完整的 TCM 診所網站，包含：
- ✅ 英雄區域（首屏）
- ✅ 關於診所區域
- ✅ 診療服務卡片
- ✅ 醫師團隊展示
- ✅ 健康專欄文章
- ✅ 線上預約表單
- ✅ 聯絡表單和信息

## 🗄️ 數據庫管理

### 查看數據庫內容

使用 Prisma Studio：

```bash
npm run db:studio
```

這將在瀏覽器中打開可視化數據庫管理工具。

### 推送數據庫變更

修改 `prisma/schema.prisma` 後：

```bash
npm run db:push
```

## 📝 自訂化您的網站

### 1. 修改診所信息

編輯 [src/components/Header.tsx](src/components/Header.tsx) 和 [src/components/Footer.tsx](src/components/Footer.tsx)：

```typescript
// 修改診所名稱和聯絡信息
const clinicInfo = {
  name: 'YUAN',
  subtitle: '中醫診所',
  address: '台北市中山區民生東路123號',
  phone: '(02) 2567-8901',
  email: 'info@yuanclinic.com.tw'
}
```

### 2. 更新色彩方案

編輯 [tailwind.config.ts](tailwind.config.ts)：

```typescript
theme: {
  extend: {
    colors: {
      'tcm-green': '#4a7c59',      // 修改主綠色
      'tcm-light-green': '#6ba876', // 修改淺綠色
      'tcm-beige': '#e8dcc8',       // 修改米色
      // ... 其他顏色
    }
  }
}
```

### 3. 添加/編輯醫師信息

編輯 [src/components/TeamSection.tsx](src/components/TeamSection.tsx) 的 `doctors` 數組

### 4. 添加/編輯診療服務

編輯 [src/components/ServicesSection.tsx](src/components/ServicesSection.tsx) 的 `services` 數組

### 5. 添加/編輯健康文章

編輯 [src/components/ArticlesSection.tsx](src/components/ArticlesSection.tsx) 的 `articles` 數組

### 6. 替換圖片和媒體

在 `public/` 文件夾中創建子文件夾：

```
public/
├── images/
│   ├── clinic/
│   │   ├── clinic-interior.jpg
│   │   └── clinic-exterior.jpg
│   ├── doctors/
│   │   └── doctor-photos.jpg
│   └── articles/
│       └── article-images.jpg
```

然後在組件中引用：

```typescript
import Image from 'next/image'

<Image 
  src="/images/clinic/clinic-interior.jpg"
  alt="診所內部"
  width={600}
  height={400}
/>
```

## 🔌 API 端點

### 預約 API

**創建預約**
- **路徑**: `POST /api/appointments`
- **請求體**:
```json
{
  "name": "患者名字",
  "email": "patient@email.com",
  "phone": "(02) XXXX-XXXX",
  "date": "2024-06-20",
  "service": "初診諮詢",
  "message": "額外備註（可選）"
}
```

**獲取預約**
- **路徑**: `GET /api/appointments`
- **返回**: 最近 10 條預約記錄

### 聯絡 API

**創建聯絡消息**
- **路徑**: `POST /api/contact`
- **請求體**:
```json
{
  "name": "聯絡人名字",
  "email": "contact@email.com",
  "subject": "訊息主旨",
  "message": "訊息內容"
}
```

**獲取聯絡消息**
- **路徑**: `GET /api/contact`
- **返回**: 最近 20 條聯絡消息

## 🧪 測試表單

1. 打開應用: http://localhost:3000
2. 滾動到「立即預約」部分
3. 填寫表單並提交
4. 檢查 Prisma Studio 中的數據：`npm run db:studio`

## 🔨 常用命令

| 命令 | 說明 |
|------|------|
| `npm run dev` | 啟動開發服務器 |
| `npm run build` | 構建生產版本 |
| `npm start` | 運行生產服務器 |
| `npm run lint` | 檢查代碼質量 |
| `npm run db:push` | 推送數據庫變更 |
| `npm run db:studio` | 打開數據庫管理工具 |

## 🐛 故障排除

### 連接到數據庫時出錯

**症狀**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**解決方案**:
1. 確保 PostgreSQL 正在運行：
   - Windows: 檢查服務
   - macOS: `brew services list`
   - Linux: `sudo systemctl status postgresql`
2. 檢查 `.env.local` 中的 DATABASE_URL
3. 驗證數據庫和用戶是否存在

### npm install 失敗

**症狀**: 安裝依賴時出錯

**解決方案**:
```bash
# 清除 npm 緩存
npm cache clean --force

# 刪除 node_modules 和 package-lock.json
rm -r node_modules package-lock.json

# 重新安裝
npm install
```

### 端口 3000 已被占用

**症狀**: `Error: listen EADDRINUSE: address already in use :::3000`

**解決方案**:
```bash
# 指定不同的端口
npm run dev -- -p 3001
```

### Prisma 相關錯誤

**症狀**: Prisma 客戶端生成失敗

**解決方案**:
```bash
# 重新生成 Prisma 客戶端
npx prisma generate

# 確保模型與數據庫同步
npm run db:push
```

## 📦 構建和部署

### 構建生產版本

```bash
npm run build
```

### 在本地運行生產版本

```bash
npm start
```

### 部署到 Vercel（推薦）

1. 將代碼推送到 GitHub
2. 前往 [https://vercel.com](https://vercel.com)
3. 連接您的 GitHub 倉庫
4. 設置環境變量
5. 部署！

Vercel 將自動：
- 構建您的應用
- 運行數據庫遷移
- 生成 Prisma 客戶端
- 部署到全球 CDN

## 📚 有用的資源

- [Next.js 文檔](https://nextjs.org/docs)
- [Tailwind CSS 文檔](https://tailwindcss.com/docs)
- [Prisma 文檔](https://www.prisma.io/docs/)
- [PostgreSQL 文檔](https://www.postgresql.org/docs/)
- [TypeScript 文檔](https://www.typescriptlang.org/docs/)

## 🤝 貢獻

如有改進建議，歡迎提交 Pull Request。

## 📄 授權

此項目採用 MIT 授權。

## 📞 支援

如遇問題，請：

1. 檢查本文檔中的故障排除部分
2. 查看 [README.md](README.md) 文件
3. 檢查項目的 GitHub Issues
4. 聯絡開發人員

---

**祝您構建成功！** 🎉

如有任何問題或需要進一步幫助，請隨時詢問。
