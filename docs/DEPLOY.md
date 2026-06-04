# 新服务器部署指南

目标服务器：

- 公网 IP：`43.163.215.149`
- 内网 IP：待服务器侧确认
- 域名：`www.yunmai.life`、`yunmai.life`
- SSH：`ssh -i Hongkong_ssh.pem ubuntu@43.163.215.149`
- 项目目录：`/var/www/HaloCare`
- 数据策略：全新部署，不迁移旧用户数据
- 共存约束：不要删除或覆盖 `yicehui.art`、`/var/www/yicehui`、`/opt/yicehui`、`/opt/openclaw`、`openclaw-gateway.service`、`yicehui-docx.service`

## 1. DNS 与 SSH

部署前确认域名 A 记录已经指向公网 IP：

```powershell
Resolve-DnsName www.yunmai.life -Type A
Resolve-DnsName yunmai.life -Type A
```

Windows 上如果 SSH 提示私钥权限过宽，收紧根目录密钥权限：

```powershell
$user = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
icacls .\Hongkong_ssh.pem /inheritance:r
icacls .\Hongkong_ssh.pem /remove:g "Authenticated Users" "BUILTIN\Users" "Everyone"
icacls .\Hongkong_ssh.pem /grant:r "${user}:R"
```

## 2. 安装服务器基础环境

在服务器执行：

```bash
sudo apt update
sudo apt install -y curl ca-certificates nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

验证：

```bash
node -v
npm -v
nginx -v
pm2 -v
```

## 3. 上传源码

推荐使用 GitHub Actions 自动部署：推送到 `master` 或手动触发 `.github/workflows/deploy.yml` 后，工作流会打包干净源码、上传到 `/tmp/halocare-release.tgz`，在服务器保留 `/var/www/HaloCare/storage` 和 `/var/www/HaloCare/server/.env` 后执行根目录 `deploy.sh`。

仓库需要配置 Secrets：

- `SERVER_HOST=43.163.215.149`
- `SERVER_USER=ubuntu`
- `SERVER_SSH_KEY`：`Hongkong_ssh.pem` 对应私钥内容
- `SERVER_PORT=22`（可选）

不得把 `.pem`、`.env`、`storage/` 或真实用户数据提交到 GitHub。

如需手动兜底部署，从本地已提交的 Git 源码生成干净归档，避免把本地依赖、构建产物、密钥、IDE 状态或生产数据打进去：

```powershell
git archive --format=tar.gz -o halocare-release.tgz HEAD
scp -i Hongkong_ssh.pem halocare-release.tgz ubuntu@43.163.215.149:/tmp/
```

服务器解包：

```bash
sudo mkdir -p /var/www/HaloCare
sudo chown -R ubuntu:ubuntu /var/www/HaloCare
tar -xzf /tmp/halocare-release.tgz -C /var/www/HaloCare
chmod +x /var/www/HaloCare/deploy.sh
```

## 4. 配置后端环境变量

创建 `/var/www/HaloCare/server/.env`：

```bash
cat > /var/www/HaloCare/server/.env <<'EOF'
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxx
PORT=4000
HOST=127.0.0.1
JWT_SECRET=replace_with_a_long_random_secret
CREATE_DEFAULT_ROOT_USER=false
EOF
```

`DASHSCOPE_API_KEY` 是阿里云 DashScope 密钥，`JWT_SECRET` 使用随机长字符串。生产环境保持 `CREATE_DEFAULT_ROOT_USER=false`。

## 5. 构建并启动后端

```bash
cd /var/www/HaloCare
./deploy.sh
```

脚本会完成：

- 安装前端依赖
- 构建 `dist/`
- 安装后端依赖
- 启动或重载 PM2 进程 `halocare-backend`

检查：

```bash
pm2 list
curl http://127.0.0.1:4000/api/test
```

## 6. 配置 Nginx 与 HTTPS

先写入 HTTP 配置，确保 Certbot 可以完成域名校验：

```bash
sudo tee /etc/nginx/sites-available/halocare >/dev/null <<'EOF'
server {
    listen 80;
    server_name www.yunmai.life yunmai.life;

    root /var/www/HaloCare/dist;
    index index.html;
    client_max_body_size 50m;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_buffering off;
    }
}
EOF

sudo test -e /etc/nginx/sites-enabled/yicehui
sudo ln -sf /etc/nginx/sites-available/halocare /etc/nginx/sites-enabled/halocare
sudo nginx -t
sudo systemctl reload nginx
```

签发证书：

```bash
sudo certbot --nginx -d www.yunmai.life -d yunmai.life --non-interactive --agree-tos --register-unsafely-without-email
```

然后用 [NGINX_CONFIG.md](NGINX_CONFIG.md) 中的最终 HTTPS 配置覆盖 Nginx 配置，并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 7. 验证线上服务

```bash
curl -I https://www.yunmai.life
curl https://www.yunmai.life/api/test
```

手机端必须使用 `https://www.yunmai.life` 访问，HTTP 和裸 IP 都无法稳定调用摄像头权限。
