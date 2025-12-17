# 后端服务（Express）

## 环境配置
- 复制 `server/.env.example` 为 `server/.env`
- 设置 `DASHSCOPE_API_KEY` 为阿里云 DashScope 的密钥
- 可选：设置 `PORT`（默认 `4000`）

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
    - `model`：字符串（如 `qwen-plus`、`qwen-vl-max`）
    - `messages`：OpenAI 兼容的消息数组（支持 `image_url`）
    - `temperature`：数值
    - `stream`：布尔值（支持流式返回）
  - 响应：
    - 非流式：JSON（兼容 OpenAI 格式）
    - 流式：`text/event-stream`（逐行 `data:` 推送）

## 前端联调
- 已在 `vite.config.ts` 配置 `server.proxy` 将 `/api` 代理到 `http://localhost:4000`
- 前端调用统一走 `/api/...`，无需暴露密钥
