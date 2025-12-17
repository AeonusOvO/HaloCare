# 部署指南 (Deployment Guide)

你好！这是为您准备的服务器部署指南。

## 1. 获取最新代码
在您的服务器终端中，进入项目目录并拉取最新代码：
```bash
cd /path/to/your/project  # 进入您的项目文件夹
git pull origin master    # 拉取最新的代码
```

## 2. 安装依赖
如果是第一次部署或 `package.json` 有变动，需要安装依赖。

**安装前端依赖：**
```bash
# 在项目根目录
npm install
```

**安装后端依赖：**
```bash
cd server
npm install
cd ..  # 返回根目录
```

## 3. 启动服务 (推荐方式)

为了让服务在后台持续运行（即使您关闭了终端），强烈推荐使用 `pm2` 工具。

### 安装 PM2 (如果还没安装)
```bash
npm install -g pm2
```

### 启动后端 (Backend)
```bash
# 进入 server 目录
cd server

# 使用 pm2 启动 (起个名字叫 backend)
pm2 start index.js --name "halocare-backend"

# 确认后端正常运行
pm2 logs halocare-backend
# 如果看到 "Backend server running on http://localhost:4000" 说明成功
# 按 Ctrl + C 退出日志查看 (服务仍在运行)

cd .. # 返回根目录
```

### 启动前端 (Frontend)

**方式 A：开发模式 (最简单，适合测试)**
```bash
# 直接在 3000 端口启动
pm2 start "npm run dev -- --host" --name "halocare-frontend"
```
*注意：开发模式性能较差，且非 HTTPS 环境下手机可能无法调用摄像头。*

**方式 B：生产模式 (最佳实践)**
1. 构建静态文件：
   ```bash
   npm run build
   ```
   这会在项目根目录下生成一个 `dist` 文件夹。

2. 使用静态服务运行：
   ```bash
   # 安装简单的静态服务器 serve
   npm install -g serve
   
   # 启动 dist 目录 (端口 3000)
   pm2 start "serve -s dist -l 3000" --name "halocare-frontend"
   ```

## 4. 常用维护指令

- **查看所有服务状态**：
  ```bash
  pm2 list
  ```

- **重启服务** (代码更新后执行)：
  ```bash
  pm2 restart all
  ```

- **停止服务**：
  ```bash
  pm2 stop all
  ```

## 关于摄像头权限 (重要)
由于浏览器的安全限制，**手机端必须使用 HTTPS 协议才能调用摄像头**。
如果您的服务器是 HTTP (例如 `http://1.2.3.4:3000`)，手机浏览器会拒绝访问摄像头。

**解决方法：**
1. 购买域名并解析到您的服务器 IP。
2. 使用 Nginx 配置反向代理，并申请免费的 SSL 证书 (Let's Encrypt)。
3. 如果只是临时测试，部分安卓手机浏览器在 `chrome://flags` 中设置 `Insecure origins treated as secure` 可以绕过，但这比较麻烦。

建议：如果只是演示，可以使用电脑浏览器测试摄像头，或者确保手机使用的是 HTTPS 链接。
