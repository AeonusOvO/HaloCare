#!/bin/bash
set -e

# 输出日志函数
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "🚀 开始部署流程..."

# 1. 进入项目目录
cd /var/www/HaloCare

# 2. 拉取最新代码
log "📥 拉取 Git 代码..."
git pull origin master

# 3. 安装前端依赖并构建
log "📦 安装前端依赖..."
npm install
log "🏗️ 构建前端..."
npm run build

# 4. 后端处理
log "🔙 处理后端..."
cd server
log "📦 安装后端依赖..."
npm install

# 5. 重启后端服务 (使用 PM2)
log "🔄 重启后端服务..."
# 检查 pm2 是否运行了名为 halocare-backend 的进程
if pm2 list | grep -q "halocare-backend"; then
    pm2 reload halocare-backend
else
    pm2 start index.js --name "halocare-backend"
fi

# 6. 保存 PM2 状态以防重启失效
pm2 save

log "✅ 部署完成！"
