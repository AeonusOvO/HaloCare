# Nginx 配置指南 (HTTPS + 反向代理)

这是经过验证的，适用于 `halocare.life` 的最终配置。

## 核心问题复盘
之前的配置之所以一直不生效，是因为 Nginx 存在“幽灵配置”问题：
1. **配置文件脱钩**：`sites-enabled/default` 可能不再指向 `sites-available/default`，或者变成了一个独立文件。这导致无论怎么修改 `available` 下的文件，Nginx 读取的永远是旧文件。
2. **转义字符错误**：使用 `cat` 写入文件时，`$` 符号被错误转义（如 `\$host`），导致 Nginx 无法解析变量。

**解决方案**：删除所有旧的 `default` 文件，新建专属的 `halocare` 配置文件并建立新的软链接。

---

## 1. 编译前端代码 (前提)
```bash
cd /var/www/HaloCare
npm run build
```

## 2. 最终配置文件 (Standard)
建议文件路径：`/etc/nginx/sites-available/halocare`

```nginx
server {
    listen 80;
    server_name halocare.life www.halocare.life;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name halocare.life www.halocare.life;

    # 证书路径
    ssl_certificate /etc/letsencrypt/live/halocare.life/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/halocare.life/privkey.pem;

    # 安全参数
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 前端静态文件 (指向 dist 目录)
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
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 3. 启用配置 (关键步骤)
```bash
# 1. 彻底清理旧配置
sudo rm /etc/nginx/sites-enabled/default
sudo rm /etc/nginx/sites-available/default

# 2. 建立新链接
sudo ln -s /etc/nginx/sites-available/halocare /etc/nginx/sites-enabled/

# 3. 验证并重启
sudo nginx -t
sudo systemctl restart nginx
```

## 4. 确保后端运行
```bash
pm2 restart backend
```

