# Nginx 配置指南 (HTTPS + 反向代理)

由于您使用了 HTTPS (自签名证书) 访问公网 IP，且遇到“只有一个淡黄色背景”的问题，这通常是因为：
1. **浏览器无法直接运行源代码**：您可能直接将 Nginx 根目录指向了项目源码，而没有进行打包构建 (Build)。
2. **接口跨域/混合内容**：HTTPS 网页无法请求 HTTP 的接口。

请按照以下步骤修复。

## 1. 编译前端代码 (在服务器上执行)
进入项目目录，运行打包命令：
```bash
npm run build
```
成功后，会生成一个 `dist` 文件夹。这是浏览器真正能运行的文件。

## 2. 配置 Nginx (HTTPS + 域名 + 证书路径)
由于 Certbot 已经成功下载了证书，但自动配置失败，我们需要手动将证书路径填入配置文件。

请编辑配置文件：
```bash
sudo nano /etc/nginx/sites-available/default
```

**请删除原来的所有内容，直接粘贴以下完整配置：**

```nginx
# 1. HTTP 自动跳转到 HTTPS
server {
    listen 80;
    server_name aeo-space.com www.aeo-space.com;
    return 301 https://$host$request_uri;
}

# 2. HTTPS 主服务器
server {
    listen 443 ssl;
    server_name aeo-space.com www.aeo-space.com;

    # ★★★ Certbot 下载的证书路径 ★★★
    ssl_certificate /etc/letsencrypt/live/aeo-space.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aeo-space.com/privkey.pem;

    # 推荐的安全参数 (可选)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 前端静态文件
    location / {
        root /var/www/HaloCare/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端接口反向代理
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 3. 重启 Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 4. 确保后端在运行
```bash
cd server
pm2 start index.js --name "halocare-backend"
```

---

### 为什么只有淡黄色背景？
因为如果 Nginx 直接指向源码目录，浏览器加载了 `index.html` (里面有淡黄色背景样式)，但遇到 `<script src="/index.tsx">` 时，浏览器看不懂 `.tsx` 文件（需要编译成 `.js`），所以脚本报错停止执行，界面就卡在背景色了。**指向 `dist` 目录即可解决。**

### 后端需要修改代码吗？
**不需要。** 
通过上面的 Nginx 配置，Nginx 会充当“中间人”：
1. 用户访问 HTTPS 前端 -> Nginx (处理加密) -> 返回 `dist` 文件。
2. 前端请求 `/api` -> Nginx (解密) -> 转发给 `localhost:4000` (HTTP) -> 后端。
后端只需要安安静静地在本地 4000 端口运行 HTTP 即可，不需要处理 HTTPS。
