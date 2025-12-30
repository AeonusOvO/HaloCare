# 盒家康 (HeJiaKang) 设计规范手册 v1.0

## 1. 设计理念 (Design Philosophy)

**“古韵今风，智慧中医”**

盒家康的设计旨在将传统中医的文化底蕴与现代 AI 科技感完美融合。整体视觉风格追求“温润、专业、信赖”，避免冷冰冰的科技蓝，转而采用富有生命力的草本绿与纸质色调。

---

## 2. 色彩体系 (Color System)

色彩选择灵感来源于中草药与传统书画。

### 2.1 主色调 (Primary)
- **Deep Emerald (深祖母绿)**: `bg-emerald-900` (#064E3B)
  - 用于：侧边栏、主要按钮、强调文字。
  - 寓意：沉稳、生命、草本。
- **Soft Emerald (柔和绿)**: `text-emerald-50` / `bg-emerald-800`
  - 用于：选中状态、高亮文本。

### 2.2 背景色 (Background)
- **Rice Paper (宣纸白)**: `bg-[#f7f5f0]`
  - 用于：全局背景。
  - 特点：比纯白更护眼，带有纸张的温润质感。
- **Pure White (纯白)**: `bg-white` (#FFFFFF)
  - 用于：卡片容器、输入框背景。

### 2.3 辅助色 (Secondary & Accents)
- **Stone Gray (石青/岩灰)**: `text-stone-800` / `text-stone-500`
  - 用于：正文、次要文字、边框。
- **Amber Gold (琥珀金)**: `bg-amber-100` / `text-amber-700`
  - 用于：提示信息、高亮标签、VIP 标识。

### 2.4 功能色 (Functional)
- **Error (赤红)**: `text-red-600` / `bg-red-50` (错误提示)
- **Success (草绿)**: `text-emerald-600` (成功状态)

---

## 3. 排版 (Typography)

### 3.1 字体家族
- **标题 (Headings)**: `Noto Serif SC`, Serif
  - 应用：Logo、Slogan、页面大标题、重要中医术语。
  - 目的：传达传统、权威、典雅的感觉。
- **正文 (Body)**: System Sans-serif (Tailwind Default)
  - 应用：功能文本、输入框、长段落。
  - 目的：确保在各设备上的易读性与现代感。

### 3.2 字号层级
- **H1**: `text-3xl` + `font-bold` (登录页标题)
- **H2**: `text-2xl` + `font-serif` (侧边栏 Logo)
- **Body**: `text-base` (默认文本)
- **Caption**: `text-xs` + `tracking-widest` (副标题、版权信息)

---

## 4. 组件规范 (Component Specs)

### 4.1 按钮 (Buttons)
- **形状**: `rounded-xl` (大圆角，亲和力强)
- **样式**: 
  - 主按钮: `bg-emerald-900 text-white shadow-lg`
  - 悬停: `hover:bg-emerald-800 hover:shadow-xl`
  - 激活: `active:scale-[0.98]` (微缩反馈)
- **交互**: 均带有 `transition-all duration-300` 过渡。

### 4.2 卡片 (Cards)
- **容器**: `bg-white rounded-3xl shadow-2xl`
- **边距**: 内部 `p-8`，保持呼吸感。
- **动效**: 
  - 进入: `translate-y-10 opacity-0` -> `translate-y-0 opacity-100`

### 4.3 输入框 (Inputs)
- **样式**: `bg-stone-50 border border-stone-200 rounded-xl`
- **状态**:
  - 默认: 灰色边框，灰色图标。
  - 聚焦: `focus:bg-white focus:border-emerald-600 focus:ring-4` (绿色光晕)。
- **图标**: 左侧集成 Lucide Icon，聚焦时变色。

---

## 5. 布局与导航 (Layout & Navigation)

### 5.1 响应式策略
- **桌面端 (Desktop, md+)**:
  - **左侧侧边栏**: 固定宽度 `w-64`，深色背景。
  - **内容区**: 右侧自适应。
- **移动端 (Mobile)**:
  - **底部导航栏**: 固定底部，白色背景。
  - **核心功能**: "AI 辩证" 按钮在底部中央悬浮凸起。

### 5.2 栅格系统
- 使用 Tailwind CSS 的 Flexbox 与 Grid 系统。
- 间距标准: `gap-4` (1rem), `gap-8` (2rem).

---

## 6. 图标系统 (Iconography)

- **库**: `lucide-react`
- **风格**: 线性图标 (Stroke)，简洁现代。
- **大小**:
  - 导航图标: `size={20}` (桌面), `size={24}` (移动)
  - 装饰图标: `size={32}` (Logo 等)

---

## 7. 动画与交互 (Animation)

- **原则**: 轻盈、流畅、不突兀。
- **常用参数**: `duration-300`, `ease-in-out`
- **场景**:
  - **页面切换**: 渐隐渐现。
  - **表单切换**: 高度平滑过渡 (`grid-template-rows` 动画)。
  - 悬停: 元素轻微上浮 (`-translate-y`) 或图标位移。

### 7.1 交互反馈 (Interaction Feedback)
- **Hover State (悬停)**:
  - 卡片/按钮: `hover:shadow-lg`, `hover:-translate-y-1` (轻微上浮), `hover:bg-emerald-800` (颜色加深)。
  - 图标: 颜色变化 (如 `text-stone-400` -> `text-emerald-600`)。
- **Active State (点击)**:
  - `active:scale-95` 或 `active:scale-[0.98]` (按压微缩效果)。
- **Focus State (聚焦)**:
  - 输入框: `focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600`。
- **Loading State (加载)**:
  - 按钮: 显示 `Loader2` 旋转动画，禁用点击 (`disabled:opacity-50`)。

---

## 8. 代码示例 (Code Snippets)

### 8.1 常用背景类
```jsx
// 页面主容器
<div className="min-h-screen bg-[#f7f5f0] text-stone-800 font-sans">
  {/* Content */}
</div>
```

### 8.2 标题样式
```jsx
<h1 className="text-2xl font-serif font-bold tracking-wider text-emerald-900">
  盒家康
</h1>
```

### 8.3 按钮组件
```jsx
<button className="bg-emerald-900 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-emerald-800 transition-all active:scale-95">
  开始诊断
</button>
```
