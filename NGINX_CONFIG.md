# Nginx 配置指南 (HTTPS + 反向代理)

适用环境：

- 主域名：`www.yunmai.life`
- 备用域名：`yunmai.life`
- 项目目录：`/var/www/HaloCare`
- 前端目录：`/var/www/HaloCare/dist`
- 后端地址：`http://127.0.0.1:4000`
- 配置文件：`/etc/nginx/sites-available/halocare`
- 共存服务：保留 `/etc/nginx/sites-enabled/yicehui`，不要删除艺策汇配置

## 最终 HTTPS 配置

证书签发后，使用以下配置覆盖 `/etc/nginx/sites-available/halocare`：

```nginx
server {
    listen 80;
    server_name www.yunmai.life yunmai.life;
    return 301 https://www.yunmai.life$request_uri;
}

server {
    listen 443 ssl;
    server_name yunmai.life;

    ssl_certificate /etc/letsencrypt/live/www.yunmai.life/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.yunmai.life/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://www.yunmai.life$request_uri;
}

server {
    listen 443 ssl;
    server_name www.yunmai.life;

    ssl_certificate /etc/letsencrypt/live/www.yunmai.life/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.yunmai.life/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/HaloCare/dist;
    index index.html;
    client_max_body_size 50m;

    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_buffering off;
    }
}
```

## 启用配置

```bash
sudo ln -sf /etc/nginx/sites-available/halocare /etc/nginx/sites-enabled/halocare
sudo nginx -t
sudo systemctl reload nginx
```

## 证书签发与续期

首次签发：

```bash
sudo certbot --nginx -d www.yunmai.life -d yunmai.life --non-interactive --agree-tos --register-unsafely-without-email
```

检查自动续期：

```bash
sudo certbot renew --dry-run
```

## 移动端注意事项

- 手机浏览器必须访问 `https://www.yunmai.life`，不要用 `http://` 或 IP 地址。
- `client_max_body_size 50m` 用于支持手机拍照上传，否则 Nginx 默认 1 MB 容易返回 `413 Request Entity Too Large`。
- `proxy_buffering off` 和较长超时用于支持 AI 流式响应。
