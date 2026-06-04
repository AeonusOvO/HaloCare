# 后端服务（Express）

## 环境配置
- 复制 `server/.env.example` 为 `server/.env`
- 设置 `DASHSCOPE_API_KEY` 为阿里云 DashScope 的密钥
- 可选：设置 `PORT`（默认 `4000`）
- 可选：设置 `HOST`（生产默认 `127.0.0.1`，仅允许 Nginx 本机反代）
- 设置 `JWT_SECRET` 为随机长字符串
- 生产环境保持 `CREATE_DEFAULT_ROOT_USER=false`

## 安装与启动
1. 在 `server/` 目录安装依赖：
   - `npm install`
2. 启动服务：
   - `npm run dev`
3. 服务地址：
   - `http://localhost:4000`

## API
- `POST /api/chat/completions`
  - 请求体：
    - `model`：字符串，由前端按文本或多模态场景传入
    - `messages`：OpenAI 兼容的消息数组（支持 `image_url`）
    - `temperature`：数值
    - `stream`：布尔值（支持流式返回）
  - 响应：
    - 非流式：JSON（兼容 OpenAI 格式）
    - 流式：`text/event-stream`（逐行 `data:` 推送）

## 前端联调
- 本地开发已在 `vite.config.ts` 配置 `server.proxy` 将 `/api` 代理到 `http://localhost:4000`
- Web 前端调用统一走同源 `/api/...`，无需暴露密钥
- Capacitor 原生环境由 `services/apiBase.ts` 自动切到 `https://www.yunmai.life/api`
