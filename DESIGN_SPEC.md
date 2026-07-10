# 中医养生诊所首页 - 设计规范文档

## 📋 设计完成概览

已完成重新设计 **Header/Navigation** 和 **Hero Section**，保留所有现有功能与 section ID。

---

## 🎨 色彩系统

```
主色彩：
  主竹青绿      #46644D  (primary)
  柔竹绿        #5E7D65  (primary-soft)
  米白/奶油      #F6F1E8  (cream)
  
辅助色彩：
  木棕色        #735A36  (wood)
  木金色        #C8A97E  (wood-light)
  淡金色        #D6C3A5  (gold-soft)
  墨灰色        #4B4B4B  (ink)
```

---

## 📁 本地文件路径

### 竹林背景图片位置
```
/public/images/bamboo-hero.webp
```

**图片规格建议：**
- 分辨率：1920 × 1080px (16:9 宽屏)
- 格式：WebP (推荐) 或 JPEG
- 文件大小：200-400KB (已优化)
- 内容：清晨竹林、中式庭院、自然光线

**获取建议：**
- Unsplash: https://unsplash.com/search/bamboo-forest
- Pexels: https://pexels.com/search/bamboo/
- Pixabay: https://pixabay.com/search/bamboo-forest/

---

## 🖼️ Hero Section 详细规范

### 结构
```
<section id="home">
  ├─ 背景图片 (本地 bamboo-hero.webp)
  ├─ 图片滤镜处理层
  │  └─ saturate-[0.78] contrast-[0.92] brightness-[1.05]
  ├─ 左→右米白色渐层遮罩
  │  └─ from-cream/95 via-cream/65 to-cream/10
  ├─ 轻微暖光层
  │  └─ from-cream/20 via-transparent to-white/15
  └─ 文字内容区域（左侧）
     ├─ 副标题 (墨棕色 #735A36)
     ├─ 主标题 (竹青绿 #46644D)
     ├─ 正文 (墨灰色 #4B4B4B)
     └─ 按钮组
```

### 尺寸
- **手机版：** min-h-[620px] (至少620px)
- **平板版：** md:min-h-[720px]
- **桌面版：** md:max-w-7xl (最大宽度)
- **圆角：** rounded-[28px]
- **外间距：** mx-4 (手机) / mx-auto (平板+)

### 图片处理
1. **对象适配：** object-cover object-center
2. **饱和度降低：** saturate-[0.78] (减弱色彩，增加宁静感)
3. **对比度调整：** contrast-[0.92] (柔和过渡)
4. **亮度提升：** brightness-[1.05] (轻微增亮)

### 遮罩方式
**左→右米白色渐层遮罩：**
```css
/* 主遮罩 */
from-cream/95   /* 左侧 95% 不透明 */
via-cream/65    /* 中间 65% 透明度 */
to-cream/10     /* 右侧逐渐透明 */

/* 暖光遮罩 */
from-cream/20   /* 下方：柔和暖色 */
via-transparent /* 中部：无色 */
to-white/15     /* 上方：轻微白光 */
```

### 文字排版
- **标题内容：** "以中医智慧\n守护您与家人的健康"
- **标题颜色：** #46644D (竹青绿)
- **标题大小：** text-4xl (手机) → text-5xl (平板) → text-6xl (桌面)
- **副标题：** "中医养生・预防保健・全人健康管理"
- **副标题颜色：** #735A36 (木棕色)
- **正文颜色：** #4B4B4B (墨灰色)
- **正文大小：** text-base (手机) → text-lg (桌面)

### 按钮样式

**主按钮 (预约健康咨询)**
```
className="btn-primary"
background: #46644D (竹青绿)
padding: px-7 py-3.5
height: min-h-12
border-radius: rounded-2xl
shadow: shadow-[0_10px_30px_rgba(70,100,77,0.18)]
text: 白色 (白文字)
hover: bg-[#395440] (深竹青)
```

**次按钮 (了解养生服务)**
```
className="btn-secondary"
background: bg-white/55 (半透明白色)
backdrop: backdrop-blur-md (毛玻璃效果)
padding: px-7 py-3.5
height: min-h-12
border-radius: rounded-2xl
text: #46644D (竹青绿文字)
hover: bg-white/75 (更不透明)
```

---

## 🎯 Navigation/Header 详细规范

### 结构
```
<header>
  ├─ Logo + Brand Name (瀛爱)
  ├─ 导航菜单
  │  ├─ 关于我们 (#about)
  │  ├─ 养生服务 (#services)
  │  ├─ 医师团队 (#team)
  │  ├─ 健康专栏 (#articles)
  │  └─ 联系我们 (#contact)
  ├─ 预约咨询按钮（右侧，唯一有底色）
  └─ 汉堡菜单（手机版）
```

### 样式设置

**背景**
```css
background: cream/88           /* 半透明米白 (88% 不透明) */
backdrop-filter: blur(12px)    /* 毛玻璃模糊效果 */
border-bottom: 1px solid      
border-color: primary/8        /* 极淡竹青边界线 */
```

**导航链接 - 普通状态**
```css
color: #4B4B4B              /* 墨灰色文字 */
font-size: 0.875rem         /* text-sm */
letter-spacing: 0.05em      /* 细微字距 */
transition: all 0.3s        /* 平滑过渡 */
position: relative
```

**导航链接 - Hover 状态**
```css
color: #46644D              /* 变为竹青绿 */
下划线: 
  position: absolute bottom-0 left-1/2
  width: 0 → 100% (扩展动画)
  height: 2px (细线)
  background: #C8A97E       /* 木金色细线 */
  transition: all 0.3s      /* 300ms平滑扩展 */
```

### 间距设置
```
lg:flex              /* 桌面版显示水平导航 */
gap-12               /* 导航项目间距 12 单位 */
px-5 md:px-8         /* 横向内间距 */
h-20                 /* 高度 80px */
```

### Logo/品牌
- **文字：** "瀛爱"
- **颜色：** #46644D (竹青绿)
- **副标题：** "全人健康管理中心" (仅桌面显示)
- **副标题颜色：** #735A36 (木棕色)

### 预约按钮（右侧）
```
显示条件: hidden lg:inline-flex    /* 仅桌面显示 */
shape: rounded-full                /* 胶囊形 */
background: #46644D               /* 竹青绿 */
padding: px-5 py-2.5
text: 白色小字体
hover: bg-[#395440]               /* 深竹青 */
是否阴影: 无
```

### 手机菜单 (Hamburger)
```
显示条件: lg:hidden               /* 仅手机显示 */
icon: "☰" (三条横线)
color: #46644D                    /* 竹青绿 */
size: w-11 h-11
```

---

## 📝 已修改文件清单

### 1. **src/components/Header.tsx**
- ✅ 移除导航中的 "首页" 
- ✅ 保留：关于我们、养生服务、医师团队、健康专栏、联系我们
- ✅ 导航间距调整：gap-8 → gap-12
- ✅ 下划线优化：h-px → h-0.5
- ✅ 字距调整：tracking-wide → tracking-[0.05em]

### 2. **src/components/HeroBanner.tsx**
- ✅ 使用本地图片：/images/bamboo-hero.webp
- ✅ 图片滤镜：saturate contrast brightness
- ✅ 米白色渐层遮罩：from-cream/95 via-cream/65 to-cream/10
- ✅ 暖光层：from-cream/20 via-transparent to-white/15
- ✅ 标题颜色：#46644D
- ✅ 按钮样式已配置
- ✅ section id="home" 保留

### 3. **tailwind.config.ts**
- ✅ 已定义所有色彩变量

### 4. **src/styles/globals.css**
- ✅ 已定义 .btn-primary 和 .btn-secondary 类
- ✅ 背景渐层和色彩设置

---

## 🔄 Navigation 交互方式

### 桌面版 (≥1024px)
1. **正常状态：** 墨灰色文字
2. **Hover 状态：** 
   - 文字变竹青绿
   - 下方出现木金色细线（0 → 100%宽度，300ms动画）
3. **点击后：** 导航至对应 section

### 手机版 (<1024px)
1. **默认：** 隐藏导航，显示汉堡菜单 (☰)
2. **点击汉堡：** 展开/收起导航菜单
3. **点击导航项：** 导航至对应 section，关闭菜单

### 预约按钮
- **桌面：** 始终显示在右侧
- **手机：** 可在汉堡菜单中显示或在导航中

---

## ✅ 保留的现有功能 & Section ID

| Section | ID | 状态 |
|---------|-----|------|
| Hero | #home | ✅ 保留 |
| About | #about | ✅ 保留 |
| Services | #services | ✅ 保留 |
| Team | #team | ✅ 保留 |
| Articles | #articles | ✅ 保留 |
| Appointment | #appointment | ✅ 保留 |
| Contact | #contact | ✅ 保留 |

所有 section 的功能和 ID 均未改变，只修改了 Header 和 Hero 的视觉设计。

---

## 📱 响应式布局

### 断点
- **手机：** < 768px (md)
- **平板：** 768px - 1024px (md to lg)
- **桌面：** ≥ 1024px (lg)

### Hero 尺寸
| 设备 | 最小高度 | 宽度 | 外间距 |
|------|--------|------|--------|
| 手机 | 620px | 100% | mx-4 |
| 平板 | 720px | 100% | mx-auto |
| 桌面 | 720px | max-w-7xl | mx-auto |

### Header 尺寸
| 设备 | 显示内容 | 宽度 |
|------|--------|------|
| 手机 | Logo + 汉堡菜单 | 100% |
| 平板 | Logo + 预约 + 汉堡 | 100% |
| 桌面 | Logo + 导航 + 预约 | max-w-7xl |

---

## 🎨 设计理念

**整体风格：** 清晨竹林中的现代中式养生空间
- 🌅 **宁静：** 低饱和色、温暖的米白背景
- 🍃 **自然：** 竹林意象、柔和渐层、有机排版
- ✨ **简洁：** 大量留白、纯文字导航、极简装饰
- 🌿 **养生感：** 不是医院的冷峻，而是疗愈空间

**不使用：**
- ❌ 纯白大面积背景
- ❌ 大量边框和分割线
- ❌ 深黑阴影和高对比度
- ❌ 鲜红色或强烈金色
- ❌ 医疗软件风格

**使用：**
- ✅ 米白奶油色背景
- ✅ 低饱和竹绿色强调
- ✅ 自然的光线过渡
- ✅ 中式茶空间美学
- ✅ 大量空白与呼吸感

---

## 🚀 下一步（未来优化）

1. **其他 Sections：** AboutSection、ServicesSection、TeamSection 等配色更新
2. **卡片设计：** 使用极淡绿色阴影而非深色阴影
3. **动画效果：** 加入平滑的 fade-in、slide 动画
4. **字体：** 确认使用 Noto Sans TC 保持统一
5. **图片优化：** 其他 section 的图片也应降低饱和度

---

## 📞 技术栈

- **框架：** Next.js 15.5.20
- **样式：** Tailwind CSS 4.x
- **图片：** Next.js Image 组件
- **字体：** Noto Sans TC (Google Fonts)
- **浏览器支持：** 现代浏览器 (Chrome, Firefox, Safari, Edge)
