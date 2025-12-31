# 盒家康智慧中医·开发词典

## 概览
- 前端：React + Vite，Tailwind（CDN），lucide-react 图标
- 后端：Express + 文件存储（storage/），JWT 认证
- 打包：Capacitor（Android），Vercel/自托管云部署
- 主题：米色纸感背景 + 翠绿主色，中文字体 Noto Serif SC

## 目录结构
- 前端入口：[index.tsx](file:///e:/Programs/HaloCare/index.tsx)
- 应用框架：[App.tsx](file:///e:/Programs/HaloCare/App.tsx)
- 组件目录：[components/](file:///e:/Programs/HaloCare/components)
- 全局上下文：[DiagnosisContext.tsx](file:///e:/Programs/HaloCare/contexts/DiagnosisContext.tsx)
- 服务接口：[api.ts](file:///e:/Programs/HaloCare/services/api.ts)、[qwenService.ts](file:///e:/Programs/HaloCare/services/qwenService.ts)
- 类型定义：[types.ts](file:///e:/Programs/HaloCare/types.ts)
- 样式与页面模板：[index.html](file:///e:/Programs/HaloCare/index.html)、[index.css](file:///e:/Programs/HaloCare/index.css)
- 后端服务：[server/index.js](file:///e:/Programs/HaloCare/server/index.js)、[server/db.js](file:///e:/Programs/HaloCare/server/db.js)
- 存储根目录：storage/（运行时生成）
- 文档目录：[docs/](file:///e:/Programs/HaloCare/docs)

## 应用视图与路由
- 视图枚举：[types.ts:AppView](file:///e:/Programs/HaloCare/types.ts#L33-L43)
- 内建路由：通过 [App.tsx](file:///e:/Programs/HaloCare/App.tsx#L71-L99) 的 switch 切换视图，无 react-router
- 底部悬浮胶囊：[FloatingCapsule.tsx](file:///e:/Programs/HaloCare/components/FloatingCapsule.tsx)
- 布局组件：[Layout.tsx](file:///e:/Programs/HaloCare/components/Layout.tsx)

## 关键页面与功能
- 主页：[Home.tsx](file:///e:/Programs/HaloCare/components/Home.tsx)
  - 智能体质辨识入口
  - 智能健康看板
  - 时令药膳推荐（每日水果抓取与滤镜）
  - 个性化运动方案与情志调摄
  - 快速服务入口（AI 辨证、问诊、提醒、紧急联系人）
- 健康档案：[HealthProfile.tsx](file:///e:/Programs/HaloCare/components/HealthProfile.tsx)
- AI 诊断（AR）：[ARDiagnosis.tsx](file:///e:/Programs/HaloCare/components/ARDiagnosis.tsx)
- 社区与会诊：[Community.tsx](file:///e:/Programs/HaloCare/components/Community.tsx)、[SmartConsultation.tsx](file:///e:/Programs/HaloCare/components/SmartConsultation.tsx)
- 认证与登录：[Auth.tsx](file:///e:/Programs/HaloCare/components/Auth.tsx)

## 个性化与云同步
- 排序算法库：[personalization.ts](file:///e:/Programs/HaloCare/utils/personalization.ts)
  - 模型：每卡片维护 impressions/clicks/lastInteractedAt
  - 策略：Thompson Sampling + 时间衰减
  - 本地模型：localStorage，以 habit_model_{userId} 为键
  - 接口：recordImpression、recordClick、sortByPreference、setModelForUser、resetModel
- 云端模型：
  - 后端路由：
    - GET /api/habits → 获取用户习惯模型（JSON）
    - POST /api/habits → 覆盖保存习惯模型
    - POST /api/habits/event → 记录曝光/点击并返回最新模型
  - 服务封装：[api.ts](file:///e:/Programs/HaloCare/services/api.ts#L228-L263)
  - 前端接入：主页初始化拉取云模型并写入本地，[Home.tsx](file:///e:/Programs/HaloCare/components/Home.tsx#L20-L41)，曝光/点击事件实时上报
  - 存储位置：storage/users/{userId}/habits.json
- 设计原则：
  - 先云后本地：有网时优先云模型；无网时本地兜底
  - 异步无阻塞：上报采用 fire-and-forget，UI 不等待响应

## 后端接口汇总
- 认证
  - POST /api/auth/register、POST /api/auth/login、GET /api/auth/me
- 家庭与通知
  - POST /api/family/create、GET /api/family/my、POST /api/family/invite、GET /api/user/notifications、POST /api/user/notifications/:id/respond、POST /api/family/role
- 诊断任务与历史
  - POST /api/diagnosis/start、GET /api/diagnosis/active、GET /api/diagnosis/task/:taskId
  - GET /api/diagnosis、GET /api/diagnosis/:id、POST /api/diagnosis、DELETE /api/diagnosis/:id
- 健康档案
  - GET /api/profiles、POST /api/profiles、PUT /api/profiles/:id、DELETE /api/profiles/:id
- 文件上传
  - POST /api/upload/photo、GET /api/photos/:userId/:filename
- 习惯模型（新）
  - GET /api/habits、POST /api/habits、POST /api/habits/event
- 健康检查
  - GET /api/test

## 存储结构（server/storage）
- users/{userId}/profile.json
- users/{userId}/notifications.json
- users/{userId}/health_profiles/{profileId}.json
- users/{userId}/diagnosis_index.json
- users/{userId}/diagnosis_records/{id}.json
- users/{userId}/photos/{filename}
- users/{userId}/habits.json（新）
- families/{familyId}.json
- user_index.json（用户名到ID索引）

## 本地开发
- 安装依赖：npm i
- 启动前端：npm run dev
- 构建前端：npm run build
- 启动后端（独立 Node 进程，需设置 JWT_SECRET/DASHSCOPE_API_KEY）：node server/index.js
- 预览构建：npm run preview

## 部署要点
- 前端静态站：Vercel 或 Nginx，参考 [DEPLOY.md](file:///e:/Programs/HaloCare/docs/DEPLOY.md)、[NGINX_CONFIG.md](file:///e:/Programs/HaloCare/docs/NGINX_CONFIG.md)
- 后端服务：云主机/容器，开放 /api 路由；持久化挂载 storage/ 目录
- 环境变量：JWT_SECRET、DASHSCOPE_API_KEY、PORT
- 备份策略：定期备份 storage/ 目录（用户数据）

## 编码约定
- 不写内联注释（保持代码整洁），类型与命名清晰
- UI 使用 Tailwind 类，遵循米色/翠绿主题与中文排版
- 前端接口全部从 [api.ts](file:///e:/Programs/HaloCare/services/api.ts) 统一调用
- 时间与ID统一由后端生成或校正

## 常见扩展
- 节气与天气 API 融合：生成更精准药膳/作息建议
- 习惯模型上云联邦：跨设备同步 + 引入上下文特征（时间/地点/体质）
- Masonry 布局与动效：提升首页“气韵”

## 相关文档
- 主页个性化说明：[HOME_PERSONALIZATION.md](file:///e:/Programs/HaloCare/docs/HOME_PERSONALIZATION.md)
- 架构说明：[ARCHITECTURE.md](file:///e:/Programs/HaloCare/docs/ARCHITECTURE.md)
- 设计规范：[DESIGN_SPEC.md](file:///e:/Programs/HaloCare/docs/DESIGN_SPEC.md)
- 部署指南：[DEPLOY.md](file:///e:/Programs/HaloCare/docs/DEPLOY.md)
- 服务运维：[SERVER_MANUAL.md](file:///e:/Programs/HaloCare/docs/SERVER_MANUAL.md)

