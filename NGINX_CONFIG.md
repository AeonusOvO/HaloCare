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

## 2. 配置 Nginx (HTTPS + 域名)
请修改您的 Nginx 配置文件（通常在 `/etc/nginx/sites-available/default`）。

请参考以下完整配置 (适配 Certbot 自动管理 SSL)：

```nginx
server {
    server_name aeo-space.com www.aeo-space.com; # 您的域名

    # 1. 前端静态文件 (指向 dist 目录)
    location / {
        root /var/www/HaloCare/dist; # !!! 注意这里要指向 dist 目录 !!!
        index index.html;
        try_files $uri $uri/ /index.html; # 支持 React 路由刷新
        
        # 显式定义 MIME 类型，防止 .js 文件报 404 或类型错误
        types {
            text/html html htm shtml;
            text/css css;
            text/xml xml;
            image/gif gif;
            image/jpeg jpeg jpg;
            application/javascript js;
            application/atom+xml atom;
            application/rss+xml rss;
            font/ttf ttf;
            font/woff woff;
            font/woff2 woff2;
            image/svg+xml svg;
        }
    }

    # 2. 后端接口反向代理 (关键！)
    # 将 /api 开头的请求转发给本地运行的 4000 端口后端
    location /api/ {
        proxy_pass http://localhost:4000/api/; 
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SSL 配置将由 Certbot 自动添加，此处不需要手动填写
}
```

## 3. 安装免费 SSL 证书 (Let's Encrypt)
因为自签名证书会被浏览器拦截 (HSTS)，请使用 Certbot 获取正版证书：

```bash
# 1. 安装 Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 2. 获取证书并自动配置
sudo certbot --nginx -d aeo-space.com -d www.aeo-space.com
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
