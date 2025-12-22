# Linux 小白必看：盒家康项目运维手册

你好！这是为您整理的 Ubuntu 服务器常用指令手册。不用背下来，需要的时候复制粘贴即可。

---

## 🚀 场景一：代码更新流程 (最常用)
每当您在本地修改了代码并推送到 GitHub 后，在服务器上执行以下“三部曲”：

### 1. 更新项目代码
```bash
cd /var/www/HaloCare        # 进入项目目录
git pull origin master      # 拉取最新代码
```

### 2. 更新前端 (网页界面)
```bash
npm install                 # 安装新依赖 (以防 package.json 有变动)
npm run build               # ★★★ 核心步骤：重新编译网页 ★★★
```
*执行完这步后，浏览器刷新即可看到界面变化。*

### 3. 更新后端 (API 接口)
```bash
cd server                   # 进入后端目录
npm install                 # 安装新依赖
pm2 restart backend         # 重启后端服务 (名字取决于您之前 pm2 list 里的名字)
cd ..                       # 返回根目录
```

---

## 🛠️ 场景二：服务管理 (PM2)
PM2 是管理后台程序的工具，它能保证您的后端一直运行，挂了自动重启。

- **查看服务状态** (检查后端活没活着):
  ```bash
  pm2 list
  ```
  *Status 显示 `online` 绿色就是正常。*

- **查看后端日志** (如果接口报错了):
  ```bash
  pm2 logs backend
  ```
  *按 `Ctrl + C` 退出查看。*

- **重启后端**:
  ```bash
  pm2 restart backend
  ```

---

## 🌐 场景三：Nginx 服务器 (网站入口)
Nginx 负责把用户的请求转发给前端文件或后端接口。

- **测试配置文件是否写错** (修改配置后必做):
  ```bash
  sudo nginx -t
  ```
  *如果显示 `successful` 就可以放心重启。*

- **重启 Nginx** (修改配置后生效):
  ```bash
  sudo systemctl restart nginx
  ```

- **编辑 Nginx 配置文件**:
  ```bash
  sudo nano /etc/nginx/sites-enabled/default
  ```
  *编辑完按 `Ctrl + O` 保存，`Enter` 确认，`Ctrl + X` 退出。*

---

## 📁 场景四：文件与权限 (救急用)
如果遇到 `Permission denied` (权限拒绝) 报错：

- **修复所有文件权限**:
  ```bash
  # 把项目的所有权交给当前用户 (假设您是用 admin 登录的)
  sudo chown -R $USER:$USER /var/www/HaloCare
  
  # 确保 Nginx (www-data 用户) 能读取 dist 目录
  sudo chmod -R 755 /var/www/HaloCare
  ```

- **查看当前目录下有什么文件**:
  ```bash
  ls -F
  ```

---

## � 场景五：配置密钥 (API Key)
某些敏感信息（如阿里云 API Key）不会随代码上传到 GitHub，需要在服务器上手动配置。

- **创建/修改配置文件**:
  ```bash
  nano /var/www/HaloCare/server/.env
  ```

- **填入内容 (格式如下)**:
  ```env
  DASHSCOPE_API_KEY=sk-你的实际密钥粘贴在这里
  ```
  *编辑完按 `Ctrl + O` 保存，`Enter` 确认，`Ctrl + X` 退出。*

- **生效配置**:
  ```bash
  pm2 restart backend
  ```

---

## 🔒 场景六：域名与 HTTPS (解决“不安全”报错)
如果您有域名 (如 `aeo-space.com`)，请不要使用自签名证书，因为会被浏览器拦截。请使用 Let's Encrypt 申请免费的正版证书。

1. **修改 Nginx 配置**:
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```
   *将 `server_name` 修改为您的域名，去掉旧的 ssl 配置，具体参考项目中的 `NGINX_CONFIG.md`。*

2. **安装 Certbot 工具**:
   ```bash
   sudo apt update
   sudo apt install -y certbot python3-certbot-nginx
   ```

3. **一键申请证书并配置**:
   ```bash
   sudo certbot --nginx -d aeo-space.com -d www.aeo-space.com
   ```
   *按提示输入邮箱，同意协议 (A)，成功后它会自动修改 Nginx 配置。*

---

## � 场景七：本地开发与代码同步 (GitHub 操作)
当您在本地电脑 (Windows/Mac) 修改完代码后，需要将其上传到 GitHub 仓库，以便服务器拉取更新。

### 0. 首次配置 (如果没配过)
告诉 Git 您是谁（只需执行一次）：
```bash
git config --global user.name "AeonusOvO"
git config --global user.email "YCG13585928550@126.com"
```

### 1. 提交更改三部曲 (最常用)
在 VS Code 终端中执行：
```bash
# 1. 添加所有更改
git add .

# 2. 提交更改并写备注
git commit -m "描述您修改了什么"
# 例如: git commit -m "修复AI辨证拍照无反应的问题"

# 3. 推送到 GitHub
git push origin master
```

### 2. 常见问题
- 如果 `git push` 报错提示冲突，先执行 `git pull` 拉取最新代码，解决冲突后再推送。
- 如果提示 LF/CRLF 警告，直接忽略即可，不影响使用。

---

## �💡 常见问题速查

1. **网页白屏？**
   - 检查是否执行了 `npm run build`。
   - 检查 Nginx 配置里的 `root` 是否指向了 `/var/www/HaloCare/dist`。

2. **API 报 500 或 404？**
   - 运行 `pm2 list` 看看后端是不是挂了。
   - 运行 `curl http://localhost:4000/api/test` 自测一下。

3. **HTTPS 证书过期？**
   - 如果是自签名证书，浏览器会提示不安全，点“高级 -> 继续访问”即可。
   - 如果想换正式证书，把新的 `.pem` 文件上传覆盖 `/var/www/HaloCare/` 下的旧文件，然后 `sudo systemctl restart nginx`。

---
*祝您的项目运行顺利！有问题随时再问我。*
