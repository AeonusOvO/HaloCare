# design.md

本文件记录“云脉珍心”当前首页、登录页和四诊流程的视觉设计、交互设计与动效设计规范。凡涉及 UI、视觉层级、组件状态、页面结构或动效的修改，都必须同步检查并按需更新本文件。

## 参考依据

- Apple Human Interface Guidelines - Motion: https://developer.apple.com/design/human-interface-guidelines/motion
- Apple Human Interface Guidelines - Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
- Google Material Design - Duration & easing: https://m1.material.io/motion/duration-easing.html

落地原则：动效必须服务状态反馈、空间关系和操作理解；不得为炫技而添加。动效应符合人的触摸预期和物理直觉，并保持克制、高端、雅气。

## 设计定位

云脉珍心首页定位为“四诊健康管理与冠心病初筛演示”的登录后工作台，不是营销落地页。第一屏要让用户快速看到个人问候、四诊合参入口、个性化养生方案、多医师云会诊入口和健康管理免责声明。

整体气质：

1. 温润、安静、可信，避免医疗恐吓和夸大疗效。
2. 中医感来自字体、米纸底色、玉石绿、温补琥珀和留白，而不是堆砌传统纹样。
3. AI 感来自清晰入口、状态反馈、轻量光感和精准图标，而不是强霓虹或科幻噪声；用户界面不得显式展示模型供应商品牌。
4. 文案必须保持健康管理和辅助建议语气，不输出临床确诊承诺。

## 当前首页结构

当前首页由 `components/Home.tsx` 渲染，并置于 `components/Layout.tsx` 的桌面侧边栏和移动底部导航内。登录注册由 `components/Auth.tsx` 渲染，四诊切诊设备演示由 `components/ARDiagnosis.tsx` 渲染。

页面结构：

1. 顶部问候区：显示“早安”和用户状态，右侧为个人/家庭账户切换胶囊按钮。
2. 主视觉 Hero：深绿到青绿渐变卡片，突出“冠心病初筛与体质辨识”，右下角使用 `ScanFace` 大尺寸低透明水印。
3. 个性化养生方案：三列卡片，分别为时令食疗、起居运动、情志调摄。
4. 多医师云会诊：浅石色渐变区块，包含专家头像横滑列表和“发起会诊”主按钮。
5. 导航框架：桌面端使用左侧深绿导航；移动端使用底部导航，中间 AI 辨证按钮上浮。
6. 免责声明：健康画像、四诊报告、首页和登录注册入口必须保留“本系统仅用于健康管理和科研演示，不作为临床诊断依据。”
7. 切诊设备演示：切诊步骤默认显示“待连接设备”，真实设备未接入时允许手动填写脉象，也允许“演示连接并跳过”写入模拟脉象后进入分析。

## 登录注册页

登录注册页是品牌第一触点，必须避免“毛坯房”式内联样式。当前实现使用左右分区：

1. 桌面端左侧为深绿品牌说明区，显示云脉珍心品牌、四诊合参、脉诊设备演示连接和健康画像能力。
2. 右侧为登录/注册表单，使用圆角白色面板、图标输入框、分段切换、错误提示和主行动按钮。
3. 移动端隐藏左侧说明区，保留品牌头部、表单、移动分段切换和免责声明。
4. 输入框聚焦使用绿色描边与淡绿色 focus ring；密码显示按钮必须有 `aria-label`。
5. 提交按钮和模式切换使用 `motion-press`，表单进入使用 `motion-scale-in`，错误提示使用 `motion-enter`。

## 视觉规范

### 色彩

核心色板以自然、草木、米纸为基础：

- 页面底色：`#f7f5f0`，米纸色，用于全局背景和移动中间按钮描边。
- 主品牌深绿：Tailwind `emerald-900` / `emerald-800`，用于桌面侧栏、标题、主 Hero。
- 行动绿：`emerald-600`，用于主要图标、移动中心按钮和关键行动反馈。
- 青绿渐变：`from-emerald-800 to-teal-900`，用于 AI 核心入口和体质结果类高权重卡片。
- 石色文字：`stone-800` 正文标题，`stone-600` 正文，`stone-500` 辅助文案，`stone-200` 边框。
- 温补琥珀：`amber-100/600/800`，用于家庭模式、食疗和季节性提示。
- 静心靛蓝：`indigo-100/600`，用于情志调摄与冥想类内容。

避免事项：

1. 不把整屏做成单一深绿或单一米色主题，应保留石色、琥珀、靛蓝等辅助色维持层次。
2. 不使用大面积紫蓝渐变、强霓虹、厚重金色或装饰性光球。
3. 警示、错误、删除才使用红色；健康风险提示不得只依赖颜色表达。

### 字体

当前 `index.html` 引入 `Noto Serif SC`，页面主体也使用该字体。首页继续使用宋/明风格衬线字体营造中医气质。

- 页面主标题：`text-2xl font-serif font-bold text-emerald-900`
- Hero 标题：`text-xl font-bold`
- 分区标题：`font-bold text-stone-800`
- 正文：`text-sm text-stone-600`
- 辅助文案：`text-xs/text-sm text-stone-500`
- 标签：`text-[10px] uppercase tracking-wider`

注意：移动端不要使用过大的展示字号。卡片内标题应紧凑，避免文字撑破容器。

### 布局

- 首页容器：`p-6 max-w-4xl mx-auto space-y-6 overflow-y-auto pb-24 h-full`
- 桌面布局：`md:flex-row`，左侧 256px 侧栏，主内容居中，最大宽度 `max-w-4xl`。
- 移动布局：底部导航固定视觉层级，页面内容保留 `pb-24`，避免被底部导航遮挡。
- 卡片网格：养生方案使用 `grid grid-cols-1 md:grid-cols-3 gap-4`。
- 横滑头像列表：会诊专家头像区域保持 `overflow-x-auto`，并隐藏滚动条。

固定格式元素需要稳定尺寸：头像 `w-10 h-10`，移动中心按钮 `w-16 h-16`，图标按钮不得因状态变化造成布局跳动。

### 组件样式

Hero 卡片：

- 使用 `rounded-2xl p-6 shadow-xl relative overflow-hidden`。
- 主内容置于 `relative z-10`，水印图标使用低透明度并偏移到右下。
- Hero 按钮使用圆形胶囊，主按钮白底深绿字，次按钮半透明深绿底。

内容卡片：

- 普通卡片使用 `bg-white rounded-xl border border-stone-200 shadow-sm`。
- 图标容器使用淡色底 `p-2 rounded-lg`，图标颜色与主题一致。
- 不在卡片内部再套一层视觉上完整的卡片；需要分组时用淡背景条或分隔线。

按钮：

- 主要行动：深绿或白底深绿，圆角胶囊/`rounded-xl`，带轻阴影。
- 次要行动：浅底、描边或半透明底。
- 触控目标移动端不得低于 44px 的舒适点击高度；底部导航中心按钮已满足。

导航：

- 桌面侧栏使用深绿背景和浅绿文字，当前项使用更深绿底和白字。
- 移动底部导航使用白底和石色描边，中间 AI 入口上浮并带边框，保持第一优先级。

## 动效规范

### 当前动效盘点

现有动效主要通过 `index.html` 中的全局 CSS class 复用：

1. `motion-enter`：页面、区块和提示以淡入 + 小幅上移进入。
2. `motion-scale-in`：登录面板、切诊设备面板等高权重面板轻微缩放进入。
3. `motion-card`：卡片 hover 时轻微上浮并增强阴影。
4. `motion-press`：按钮、分段控件和可点击卡片按下时轻微压低。
5. `motion-breathe`：Hero 水印使用低幅透明度和位移呼吸，周期约 7 秒。
6. `pulse-line`：仅用于切诊演示设备已连接状态的脉搏线，不用于普通装饰。

后续 UI 修改不得停留在“只有颜色变化”。凡新增或调整可交互 UI，应补齐触摸、进入、离开或状态切换动效，并符合下面规则。

### 动效原则

1. 有目的：动效只用于反馈、引导、空间关系和状态变化。
2. 符合物理直觉：进入从触发源附近或阅读方向轻微位移；退出回到来源或向下一层消退。
3. 高端雅气：动效幅度小、时间短、曲线柔和；禁止夸张弹跳、抖动、爆炸、彩纸和无意义循环。
4. 不抢内容：医学和健康建议内容优先可读，动效不得遮挡报告、按钮或输入。
5. 可降级：必须支持 `prefers-reduced-motion: reduce`，降级为淡入淡出或即时状态变化。

### 时长与缓动

推荐 tokens：

```css
:root {
  --motion-fast: 120ms;
  --motion-base: 180ms;
  --motion-slow: 260ms;
  --motion-page: 420ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
  --ease-elegant: cubic-bezier(0.16, 1, 0.3, 1);
}
```

使用建议：

- 颜色、边框、阴影：`120ms-180ms`
- 按压、选中、开关切换：`120ms-180ms`
- 卡片进入、局部面板展开：`180ms-260ms`
- 页面或步骤切换：`320ms-420ms`
- 同组列表 stagger：每项 `24ms-40ms`，总延迟不超过 `120ms`

### 首页动效模式

页面进入：

- 首屏内容使用淡入 + `translateY(8px-12px)`，持续 `220ms-320ms`。
- Hero 先进入，方案卡片可轻微 stagger，会诊区最后进入。
- 不使用从屏幕边缘大距离滑入，避免移动端眩晕。

触摸反馈：

- 按下：`scale(0.98)` 或 `translateY(1px)`，阴影略收。
- 松开/选中：恢复尺寸，阴影轻微回弹，但不出现夸张 bounce。
- 移动底部中心按钮可保留 `active:scale-95`，但新按钮建议更克制地使用 `scale(0.97-0.98)`。

卡片 hover / press：

- 桌面 hover：`translateY(-2px)` + 阴影从 `shadow-sm` 到中等柔和阴影。
- 移动端 press：轻微压低，不使用 hover-only 信息。
- 卡片内容不得因为 hover 改变尺寸。

导航切换：

- 当前项切换时，背景胶囊应使用短时淡入/位移动效。
- 页面内容从当前导航方向轻微过渡；底部相邻 tab 可使用 `translateX(12px)`，非相邻入口可用 fade。
- 返回上一级时方向与进入方向相反。

Hero 水印与背景：

- `ScanFace` 水印可做极轻微 parallax 或呼吸透明度，但周期不得短于 `6s`，透明度变化不超过 `0.04`。
- 禁止持续旋转、频闪或大幅缩放。

加载与 AI 状态：

- 使用 `Loader2 animate-spin` 时应只表示真实等待。
- 长时间 AI 分析建议使用进度文案、分阶段状态或流式内容，而不是只靠无限旋转。
- 流式文本光标可轻微闪烁，但不得超过阅读舒适度。
- 模型加载、推演和分析状态只写“大模型”“模型推演”等中性表述，不展示具体模型供应商品牌。

### 减少动效

必须提供全局降级策略：

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 1ms !important;
  }
}
```

降级时：

1. 保留颜色、文字、图标和布局反馈。
2. 用 opacity 替代 x/y/z 位移。
3. 禁用循环呼吸、视差、缩放和自动滚动。
4. 不把动效作为唯一信息载体。

## UI 修改验收清单

每次涉及 UI 的修改，交付前必须检查：

1. 是否符合本页色彩、字体、卡片、按钮和导航规范。
2. 是否为新增/变更的交互补齐了物理直觉、克制雅气的动效。
3. 是否支持 `prefers-reduced-motion` 或有明确降级方案。
4. 是否在移动端和桌面端都不遮挡文字、按钮、底部导航和关键内容。
5. 是否更新了本 `design.md` 中受影响的规范或组件说明。
6. 是否需要同步更新 `README.md`、`AGENTS.md` 或部署/接口相关根目录文档。
