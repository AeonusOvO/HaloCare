# 云脉珍心运维手册

## 1. 系统概况

- 前端：React + Vite 单页应用
- 后端：Node.js + Express
- 数据：文件系统 JSON，目录为 `/var/www/HaloCare/storage`
- 反向代理：Nginx
- 进程管理：PM2
- 操作系统：Ubuntu 24.04 LTS

## 2. 新服务器信息

| 项目 | 详情 |
| :--- | :--- |
| 公网 IP | `43.163.215.149` |
| 内网 IP | 待服务器侧确认 |
| 主域名 | `www.yunmai.life` |
| 备用域名 | `yunmai.life` |
| SSH 登录 | `ssh -i Hongkong_ssh.pem ubuntu@43.163.215.149` |
| 项目目录 | `/var/www/HaloCare` |
| 前端构建产物 | `/var/www/HaloCare/dist` |
| 后端目录 | `/var/www/HaloCare/server` |
| 用户数据目录 | `/var/www/HaloCare/storage` |
| Nginx 配置 | `/etc/nginx/sites-available/halocare` |
| SSL 证书 | `/etc/letsencrypt/live/www.yunmai.life/` |

本次迁移按全新服务器部署，旧用户数据不迁移。生产环境 `CREATE_DEFAULT_ROOT_USER=false`，不会自动创建测试账号。

同机已有服务必须保留：

- 艺策汇：`yicehui.art`、`/var/www/yicehui`、`/opt/yicehui`、`yicehui-docx.service`
- OpenClaw/龙虾：`/opt/openclaw`、`openclaw-gateway.service`、本机端口 `18789`

发布只使用 `master` 分支。不得把生产变更推送或停留在 `codex/*`、`main` 等临时分支；如误用临时分支，先把有效变更合并或 cherry-pick 到 `master`，再推送并部署。

## 3. 服务端口

- `22`：SSH
- `80`：HTTP，强制跳转 HTTPS
- `443`：HTTPS
- `4000`：后端 API，仅本机通过 Nginx 访问

## 4. 日常部署

优先使用 GitHub Actions 自动部署：推送 `master` 或手动触发 `.github/workflows/deploy.yml`，工作流会上传干净源码包并在服务器执行 `/var/www/HaloCare/deploy.sh`。工作流只监听 `master`，仓库 Secrets 需配置 `SERVER_HOST`、`SERVER_USER`、`SERVER_SSH_KEY`，可选 `SERVER_PORT`。

手动兜底部署时，本地提交后用 Git 生成干净源码归档，再上传服务器：

```powershell
git archive --format=tar.gz -o halocare-release.tgz HEAD
scp -i Hongkong_ssh.pem halocare-release.tgz ubuntu@43.163.215.149:/tmp/
```

服务器执行：

```bash
sudo chown -R ubuntu:ubuntu /var/www/HaloCare
tar -xzf /tmp/halocare-release.tgz -C /var/www/HaloCare
chmod +x /var/www/HaloCare/deploy.sh
cd /var/www/HaloCare
./deploy.sh
sudo nginx -t
sudo systemctl reload nginx
```

## 5. 服务检查

```bash
pm2 list
pm2 logs halocare-backend
curl http://127.0.0.1:4000/api/test
curl https://www.yunmai.life/api/test
```

Nginx：

```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl reload nginx
```

SSL：

```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

## 6. 数据管理

当前部署不迁移旧数据。新用户注册、家庭关系、诊断记录和上传照片会写入：

```text
/var/www/HaloCare/storage
```

需要备份时执行：

```bash
tar -czf ~/halocare_storage_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/HaloCare/storage
```

需要清空线上用户数据时，先停后端，再删除并重启：

```bash
pm2 stop halocare-backend
rm -rf /var/www/HaloCare/storage
pm2 start halocare-backend
```

## 7. 故障处理

### 502 Bad Gateway

后端未运行或崩溃：

```bash
pm2 list
pm2 logs halocare-backend
pm2 restart halocare-backend --update-env
```

### 手机端摄像头不可用

确认手机访问的是：

```text
https://www.yunmai.life
```

不要使用 HTTP 或 IP 地址。浏览器只有在 HTTPS 安全上下文中才会稳定开放摄像头权限。

### 上传图片失败

检查 Nginx 是否包含：

```nginx
client_max_body_size 50m;
```

并检查数据目录权限：

```bash
sudo chown -R ubuntu:ubuntu /var/www/HaloCare/storage
```

### AI 接口失败

检查 `server/.env` 是否存在有效密钥：

```bash
grep -E '^(DASHSCOPE_API_KEY|PORT|JWT_SECRET|CREATE_DEFAULT_ROOT_USER)=' /var/www/HaloCare/server/.env
pm2 restart halocare-backend --update-env
```

不要把 `server/.env` 提交到 Git。

## 8. Android App

Web 端默认走同源 `/api`；Capacitor 原生环境会由 `services/apiBase.ts` 自动切到 `https://www.yunmai.life/api`。

更新 App 时在本地执行：

```powershell
npm run build
npx cap sync android
npx cap open android
```

Android 摄像头权限需保留在 `android/app/src/main/AndroidManifest.xml` 中。
