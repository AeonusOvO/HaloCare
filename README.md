# 云脉珍心

一款面向中医四诊健康管理和冠心病初筛演示的智能原型，集成体质辨识、多模态望闻问切、脉诊设备演示连接、名医云会诊与个性化养生建议。

本系统仅用于健康管理和科研演示，不作为临床诊断依据。

## 线上环境

| 项目 | 值 |
| :--- | :--- |
| 线上域名 | `https://www.yunmai.life` |
| 备用域名 | `https://yunmai.life` |
| 公网 IP | `43.163.215.149` |
| 内网 IP | 待服务器侧确认 |
| SSH 用户 | `ubuntu` |
| SSH 密钥 | 根目录 `Hongkong_ssh.pem` |
| 项目目录 | `/var/www/HaloCare` |
| 数据目录 | `/var/www/HaloCare/storage` |

新服务器按全新环境部署，旧用户数据不迁移。生产环境不会自动创建 `root/root` 测试账号。本服务器已有艺策汇 (`yicehui.art`) 和 OpenClaw/龙虾服务，部署时只新增云脉珍心自己的目录、进程和 Nginx 配置。

## 技术栈

- 前端：React 19 + TypeScript + Vite
- 后端：Node.js + Express
- 数据存储：文件系统 JSON 存储，位于项目根目录 `storage/`
- 反向代理：Nginx，负责 HTTPS、静态文件和 `/api/` 转发
- 进程管理：PM2
- 移动端：HTTPS 手机浏览器访问；Android 打包使用 Capacitor

## 本地运行

1. 安装前端依赖：
   ```bash
   npm install
   ```

2. 配置后端环境变量：
   ```bash
   cp server/.env.example server/.env
   ```

   `server/.env` 至少需要：
   ```bash
   DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxx
   PORT=4000
   HOST=127.0.0.1
   JWT_SECRET=replace_with_a_long_random_secret
   CREATE_DEFAULT_ROOT_USER=false
   ```

3. 启动后端：
   ```bash
   cd server
   npm install
   npm run dev
   ```

4. 启动前端：
   ```bash
   npm run dev
   ```

5. 访问本地应用：
   ```text
   http://localhost:3000
   ```

## 生产 API 地址

Web 端默认使用同源 `/api`，由 Nginx 转发到后端 `4000` 端口；因此无论通过域名还是临时 IP 访问，浏览器请求都会走当前站点同源 API。

Capacitor 原生环境会自动切到 `https://www.yunmai.life/api`。修改正式域名时，需要同步更新 `services/apiBase.ts` 并重新构建 Android 包。

## 部署入口

完整部署步骤见 [DEPLOY.md](DEPLOY.md)，Nginx 配置见 [NGINX_CONFIG.md](NGINX_CONFIG.md)，日常运维见 [SERVER_MANUAL.md](SERVER_MANUAL.md)。

## 技术方法

四诊合参、切诊演示连接和模型调用边界见 [TECHNICAL_METHODS.md](TECHNICAL_METHODS.md)。
