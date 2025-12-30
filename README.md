# 盒家康智慧中医 (HeJiaKang AI TCM)

一款基于大模型的智慧中医健康管理应用，集成了AI体质辨识、多模态望闻问切、名医云会诊与个性化养生方案。

## 功能特色

- **AI 望闻问切**：结合 Qwen-VL 多模态大模型，通过面诊（面色）、舌诊（舌象）与问诊（十问歌）进行综合辨证。
- **智能体质辨识**：生成精准的中医健康画像，分析体质类型（如阴虚、湿热等）。
- **个性化养生**：根据节气与体质推荐食疗、起居、导引（八段锦）与情志调摄方案。
- **名医云会诊**：模拟多位三甲专家会诊，提供综合诊疗建议。
- **家庭健康管理**：支持切换家庭账户，关注父母健康。

## 技术栈

- **前端**：React 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **后端**：Express.js (作为 API 网关与安全层)
- **AI 模型**：阿里云通义千问 (DashScope) - Qwen-Plus (文本) / Qwen-VL-Max (多模态)

## 本地运行

### 1. 准备工作

确保已安装 Node.js 环境。

### 2. 后端配置 (Server)

后端服务用于转发 API 请求，保护密钥安全。

1. 进入 server 目录：
   ```bash
   cd server
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 配置环境变量：
   复制 `.env.example` 为 `.env`，并填入您的阿里云 DashScope API Key。
   ```bash
   # server/.env
   DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxx
   PORT=4000
   ```
4. 启动后端：
   ```bash
   node index.js
   # 或使用 npm run dev (需安装 nodemon)
   ```
   后端默认运行在 `http://localhost:4000`。

### 3. 前端运行 (Client)

1. 回到项目根目录：
   ```bash
   cd ..
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
4. 访问应用：
   打开浏览器访问 `http://localhost:3000`。

## 部署说明

- 本项目包含前后端两部分，部署时建议将后端部署至支持 Node.js 的云服务（如阿里云 FC、Vercel Serverless、Render 等），前端构建后部署至静态托管服务（如 Vercel、Netlify、OSS 等）。
- 生产环境请确保环境变量配置正确。

## 文档 (Documentation)

详细的项目文档已整理至 `docs/` 目录：

- [**设计规范 (Design Spec)**](docs/DESIGN_SPEC.md): UI/UX 设计风格指南。
- [**运维手册 (Server Manual)**](docs/SERVER_MANUAL.md): 服务器配置、部署与日常运维。
- [**部署指南 (Deploy Guide)**](docs/DEPLOY.md): 自动化部署流程说明。
- [**Nginx 配置**](docs/NGINX_CONFIG.md): 反向代理详细配置。

## 目录结构

```
├── components/      # React 组件 (首页、社区、AI辩证等)
├── services/        # API 服务层
├── server/          # Express 后端服务
│   ├── index.js     # 后端入口
│   └── .env         # 后端密钥 (不上传 GitHub)
├── App.tsx          # 路由与主视图
└── vite.config.ts   # 构建与代理配置
```
