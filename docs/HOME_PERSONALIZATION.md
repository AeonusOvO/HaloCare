# 主页个性化与算法说明

## 目标
1. 让首页卡片内容更灵动与多样，契合中医审美与季节性。
2. 基于用户使用习惯进行自适应排序，优先展示用户最常用内容。
3. 引入季节性果蔬/药膳的图片抓取与色彩匹配处理，整体视觉更统一。

## 卡片体系
- 智能健康看板（smart_dashboard）
- 时令药膳推荐（seasonal_diet）
- 个性化运动方案（exercise_plan）
- 情志调摄（emotion_regulation）
- 快速服务入口（quick_services）

## 用户习惯学习原理
采用轻量级「上下文无关多臂老虎机（Thompson Sampling）」策略，结合近期活跃度做加权：
- 将每张卡片视为一个臂，奖励为点击（click），曝光为展示（impression）。
- 对每张卡片维护 Beta 分布参数：α = 1 + clicks，β = 1 + (impressions - clicks)。
- 每次需要排序时，对各卡片进行采样，得到期望偏好分数。
- 加入时间衰减因子：recencyWeight = exp(-0.15 × days_since_last_click)，使近期常用内容更靠前。
- 按分数降序排列得到个性化顺序。

数据存储：
- 本地 localStorage，键为 habit_model_{userId}。
- 记录字段：impressions、clicks、lastInteractedAt。

代码参考：
- 排序与埋点：[personalization.ts](file:///e:/Programs/HaloCare/utils/personalization.ts)
- 首页接入与埋点：[Home.tsx](file:///e:/Programs/HaloCare/components/Home.tsx)

## 季节水果图片抓取与色彩处理
原则：
- 根据当前月份在内置表中选择时令水果（如 6 月推荐西瓜/荔枝/杨梅）。
- 通过 Unsplash 的 featured 源获取与关键词匹配的图片：`https://source.unsplash.com/featured/?{fruit},fruit`。
- 为保证与应用配色（米色/翠绿）统一，使用 CSS 滤镜进行轻度校色：
  - 冬季偏暖：`saturate(0.9) contrast(1.05) sepia(0.08) hue-rotate(-10deg)`
  - 非冬季偏清新：`saturate(0.95) contrast(1.05) hue-rotate(10deg)`

如需更精确的色彩匹配，可在图片加载后使用 Canvas 做主色提取并动态计算滤镜，但考虑跨域与性能，此版本采用轻量方案。

代码参考：
- 时令水果与滤镜：[seasonal.ts](file:///e:/Programs/HaloCare/utils/seasonal.ts)
- 组合卡片展示：[Home.tsx](file:///e:/Programs/HaloCare/components/Home.tsx#L84-L174)

## 智能健康看板
内容：
- 心率/睡眠/步数的占位数据与趋势入口。
- 后续可接入设备或服务端指标，统一以同样的卡片 API 渲染。

## 快速服务入口与紧急联系人
- 一键 AI 辨证、在线问诊、用药提醒进入对应视图。
- 紧急联系人按钮作为 UI 入口，后续可绑定电话或消息服务。

## 未来扩展
- 引入地理位置与节气 API，动态生成更精准的药膳与作息建议。
- 将用户习惯模型上云，跨设备同步并引入上下文特征（时间、地点、体质）。
- Masonry 布局与动画增强，形成更具“气韵”的动态首页。

