# 盒家康智慧中医 (HaloCare) 运维手册 v1.0

## 1. 系统概述 (System Overview)

**盒家康智慧中医 (HaloCare)** 是一个基于“望闻问切”四诊合参的中医健康管理平台。

### 1.1 技术栈
- **前端**: React + Vite + TypeScript (单页应用 SPA)
- **后端**: Node.js + Express
- **数据存储**: 基于文件系统的 JSON 存储 (`/server/storage` 目录)
- **反向代理**: Nginx (处理 HTTPS 及 API 转发)
- **进程管理**: PM2 (守护 Node.js 进程)
- **操作系统**: Ubuntu 22.04 LTS (阿里云 ECS)

### 1.2 关键服务端口
- **Nginx (HTTP)**: 80 (强制跳转 HTTPS)
- **Nginx (HTTPS)**: 443
- **后端 API**: 4000 (仅限本地 `127.0.0.1` 访问)
- **SSH 管理**: 22

---

## 2. 环境信息 (Environment Info)

| 项目 | 详情 |
| :--- | :--- |
| **服务器 IP** | `47.100.126.13` |
| **域名** | `halocare.life` |
| **项目根目录** | `/var/www/HaloCare` |
| **前端构建产物** | `/var/www/HaloCare/dist` |
| **后端代码目录** | `/var/www/HaloCare/server` |
| **用户数据存储** | `/var/www/HaloCare/server/storage` (**重要数据**) |
| **Nginx 配置文件** | `/etc/nginx/sites-available/halocare` |
| **SSL 证书目录** | `/etc/letsencrypt/live/halocare.life/` |

---

## 3. 日常运维操作 (Daily Operations)

### 3.1 自动化部署 (推荐)
已配置一键部署脚本，当你需要在服务器上更新代码时：

```bash
# 1. 登录服务器
ssh admin@47.100.126.13

# 2. 执行部署脚本
/var/www/HaloCare/deploy.sh
```
*脚本会自动完成：拉取 Git 代码 -> 安装依赖 -> 编译前端 -> 重启后端。*

### 3.2 手动服务管理
如果需要单独管理服务，可以使用以下命令：

#### 3.2.1 后端服务 (PM2)
```bash
# 查看所有服务状态
pm2 list

# 查看实时日志 (排查后端报错用)
pm2 logs halocare-backend

# 重启后端
pm2 reload halocare-backend

# 停止后端
pm2 stop halocare-backend
```

#### 3.2.2 Web 服务器 (Nginx)
```bash
# 检查配置文件语法是否正确
sudo nginx -t

# 重载配置 (不中断服务)
sudo systemctl reload nginx

# 重启服务 (中断服务)
sudo systemctl restart nginx
```

### 3.3 数据备份 (Backup)
由于系统使用文件存储，**必须定期备份 storage 目录**。

```bash
# 手动备份数据到用户主目录
tar -czvf ~/backup_storage_$(date +%Y%m%d).tar.gz /var/www/HaloCare/server/storage
```

---

## 4. 故障处理流程 (Troubleshooting)

### 4.1 网站无法访问 (502 Bad Gateway)
**现象**: 浏览器显示 "502 Bad Gateway"。
**原因**: Nginx 正常运行，但后端 Node.js 服务挂了。
**处理**:
1. 检查后端状态: `pm2 list`
2. 如果状态是 `errored` 或 `stopped`，查看日志: `pm2 logs halocare-backend`
3. 尝试重启: `pm2 restart halocare-backend`

### 4.2 网站无法访问 (连接超时)
**现象**: 浏览器一直转圈，最后提示“无法连接”。
**原因**: 服务器防火墙或安全组拦截。
**处理**:
1. 登录阿里云控制台。
2. 检查 **安全组规则**，确保入方向允许 `TCP 80` 和 `TCP 443`。
3. 检查服务器防火墙: `sudo ufw status` (如果开启，需允许 Nginx)。

### 4.3 SSL 证书过期
**现象**: 浏览器提示“您的连接不是私密连接”。
**处理**:
Certbot 通常会自动续期，如果失效，手动强制续期：
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### 4.4 权限问题 (Permission Denied)
**现象**: 上传图片失败，或部署时提示无法写入文件。
**处理**:
```bash
# 修正项目目录权限为当前用户 (admin)
sudo chown -R admin:admin /var/www/HaloCare
```

---

## 5. 开发与发布流程 (Dev & Deploy)

### 5.1 本地开发 (Windows)
1. **启动环境**:
   ```powershell
   # 终端 1: 启动后端
   cd server
   node index.js
   
   # 终端 2: 启动前端
   npm run dev
   ```
2. **访问**: `http://localhost:3000`

### 5.2 提交代码
```powershell
# 1. 添加修改
git add .

# 2. 提交 (写清楚修改内容)
git commit -m "feat: 新增家庭管理功能"

# 3. 推送到 GitHub
git push
```
*注意：`storage/` 目录已被 `.gitignore` 忽略，本地测试数据不会上传，服务器数据也不会被覆盖。*

---

## 6. 安全管理 (Security)

1. **SSH 安全**:
   - 建议仅使用密钥登录，禁用密码登录。
   - 密钥已配置在 GitHub Secrets (`SERVER_SSH_KEY`) 用于自动化部署。

2. **数据安全**:
   - `server/.env` 文件包含 API Key 和 JWT Secret，**绝对不要提交到 GitHub**。
   - 定期下载备份数据文件到本地冷存储。

3. **Nginx 安全**:
   - 已配置 HTTP 强制跳转 HTTPS。
   - 仅开放必要端口，隐藏后端真实端口 (4000)。

---

## 8. 移动端 App 维护 (Android App Maintenance)

本项目使用 **Capacitor** 将 Web 应用打包为 Android App。以下操作均在 **本地 Windows 开发环境** 进行，无需在服务器上执行。

### 8.1 环境准备
确保本地已安装：
- **Node.js**
- **Android Studio** (需安装 Android SDK 和 Virtual Device)
- **Java JDK** (通常 Android Studio 会自带)

### 8.2 首次构建 App
如果你是第一次生成 Android App，请在项目根目录执行：

```powershell
# 1. 安装 Capacitor 依赖
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. 初始化 Capacitor (仅需一次)
# App Name: 盒家康智慧中医
# App ID: com.hejiakang.app
# Web asset directory: dist
npx cap init

# 3. 构建前端资源
npm run build

# 4. 添加 Android 平台
npx cap add android

# 5. 配置权限 (重要！)
# 修改 android/app/src/main/AndroidManifest.xml，在 <manifest> 标签内添加：
# <uses-permission android:name="android.permission.CAMERA" />
# <uses-permission android:name="android.permission.RECORD_AUDIO" />
# <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

### 8.3 日常更新流程
当你修改了前端 React 代码（如 `App.tsx` 或 `components/` 下的文件）并希望更新 App 时：

```powershell
# 1. 重新编译前端代码
npm run build

# 2. 同步代码到 Android 项目
npx cap sync

# 3. 打开 Android Studio 进行打包
npx cap open android
```

### 8.4 打包 APK (在 Android Studio 中)
1. 等待底部的 **Gradle Sync** 进度条完成。
2. 点击顶部菜单 **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**。
3. 编译完成后，右下角提示 "APK(s) generated successfully"。
4. 点击 **locate** 即可找到生成的 `.apk` 安装包。

### 8.5 常见问题 (App FAQ)
- **摄像头无法打开**: 检查 `AndroidManifest.xml` 是否添加了权限，且手机是否在运行时授权了 App。
- **API 请求失败**: 
  - 确保手机网络正常。
  - 确保后端服务器 (`halocare.life`) 正常运行且 SSL 证书有效（Android 默认禁止明文 HTTP 请求）。
  - 如果是本地测试，手机和电脑需在同一 WiFi 下，且 API 地址需改为局域网 IP (如 `192.168.x.x`) 而非 `localhost`。

---