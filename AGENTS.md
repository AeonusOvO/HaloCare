# AGENTS.md

本文件是“云脉珍心”的项目级协作规范。任何自动化助手、开发者或协作者修改本仓库前，都应先阅读并遵守本文件。

本文件遵循 OpenAI Codex 的 `AGENTS.md` 项目指导文件约定：Codex 会在开始工作前读取 `AGENTS.md`，并按从项目根目录到当前目录的顺序合并更近目录中的指导。官方说明见：https://developers.openai.com/codex/guides/agents-md

## 项目定位

1. 本项目是“云脉珍心”健康管理应用，面向 AI 体质辨识、多模态中医望闻问切、脉诊设备演示连接、冠心病初筛原型、名医云会诊、个性化养生方案和家庭健康管理。
2. 本项目输出应定位为健康管理、科普演示、辅助建议或原型能力，不得承诺临床确诊、治疗效果或替代医生判断。
3. 新增或修改医学/健康文案时，优先使用“辨识、辨证、分析、建议、调理、健康画像”等表述；避免新增“确诊、治愈、保证有效”等绝对化表达。
4. 涉及医学输出、报告、风险提示或 AI 分析结果时，必须保留或补充免责声明：`本系统仅用于健康管理和科研演示，不作为临床诊断依据。`

## 技术栈

1. 前端：React 19 + TypeScript + Vite。
2. 样式：Tailwind CDN（见 `index.html`）+ 少量全局 CSS；图标使用 `lucide-react`。
3. 移动端：Capacitor Android。
4. 后端：Node.js + Express，入口为 `server/index.js`。
5. 数据存储：本地文件系统 JSON，位于根目录 `storage/`。
6. AI 服务：前端通过同源 `/api` 调用后端，后端转发到 DashScope 兼容接口；不得在前端暴露模型 API Key。不得在用户界面显式展示模型供应商品牌。
7. 部署：Nginx HTTPS 反向代理 + PM2，部署说明集中在 `docs/` 目录。

## 目录规范

1. 主要页面组件放在 `components/`。
2. 应用入口为 `App.tsx`、`index.tsx`、`index.html`。
3. 前端 API 封装放在 `services/`，其中生产/原生 API 地址逻辑在 `services/apiBase.ts`。
4. 共享类型定义放在 `types.ts`。
5. 后端代码放在 `server/`，后端说明维护在 `server/README.md`。
6. 本地/生产数据放在 `storage/`，不得把真实用户数据样本写入文档或提交。
7. Android 原生工程放在 `android/`，修改 Capacitor 配置时同步检查 `capacitor.config.ts` 和部署文档。

## 文档同步要求

每次修改后，必须按变更类型检查并更新对应文档。不能只改代码不改文档。

1. 修改运行方式、技术栈、环境变量、公开能力、重要目录或用户可见行为时，检查并按需更新 `README.md`。
2. 修改 UI、布局、视觉风格、交互状态、动效、图标、颜色、文案展示层级时，必须检查并按需更新 `design.md`。
3. 修改部署流程、服务器路径、域名、证书、PM2、Nginx、反向代理或生产 API 策略时，检查并按需更新 `docs/DEPLOY.md`、`docs/NGINX_CONFIG.md`、`docs/SERVER_MANUAL.md`。
4. 修改后端 API、鉴权、存储结构、环境变量或服务启动方式时，检查并按需更新 `server/README.md`。
5. 修改 AI 调用、模型选择、医学规则、数据处理、分析流程、报告结构或可用于答辩的方法论时，检查是否需要创建或更新 `TECHNICAL_METHODS.md`。
6. 修改长期协作规则、验证命令、目录约定或设计硬性约束时，更新本 `AGENTS.md`。
7. 交付说明中必须写明“文档同步”结果：更新了哪些文档；如果无需更新，说明原因。

## 发布与同步要求

1. 本项目唯一交付和部署分支为 `master`。除非用户明确要求，不得创建、推送或交付 `codex/*`、`main` 或其他临时分支；如果工作误在 `codex/*` 分支上完成，必须先把有效变更合并或 cherry-pick 到 `master`，再推送 `origin/master`。
2. 每次完成代码或文档修改并通过必要验证后，必须将本次变更提交并推送到 GitHub 的 `master`，然后按部署文档同步到服务器。
3. 推送和服务器同步应在交付前完成；如果因权限、网络、密钥、远端冲突、未明确提交范围或工作区存在无关变更而无法完成，交付说明必须明确写出原因、当前阻塞点和建议的下一步命令。
4. 推送前必须避免把 API Key、JWT Secret、`.env`、`.pem` 私钥或真实用户数据纳入提交；如工作区中存在此类文件，只能在明确确认其安全性和提交范围后处理。
5. 服务器同步必须遵循 `docs/DEPLOY.md`、`docs/SERVER_MANUAL.md` 和 `docs/NGINX_CONFIG.md`，不得临时发明部署流程。
6. 本地除构建、测试、语法检查、浏览器验证或必要排错外，不得启动开发服务、预览服务或后端服务；验证结束后必须停止本地服务，不能让本地进程常驻运行。

## 生产服务器与自动部署

1. 当前生产服务器为腾讯云香港 `43.163.215.149`，SSH 用户为 `ubuntu`，本地私钥文件为根目录 `Hongkong_ssh.pem`。历史上海服务器 `124.221.158.247`（内网 `10.0.0.12`）和 `ssh_shanghai.pem` 仅作迁移前记录，未得到明确指令不得继续部署到旧服务器。
2. 生产域名为 `www.yunmai.life`，根域 `yunmai.life` 跳转到 `www.yunmai.life`。应用目录为 `/var/www/HaloCare`，后端 PM2 进程为 `halocare-backend`，监听 `127.0.0.1:4000`，Nginx 站点配置为 `/etc/nginx/sites-available/halocare`，证书目录为 `/etc/letsencrypt/live/www.yunmai.life/`。
3. 同一台服务器已有艺策汇和龙虾系统，部署云脉珍心时不得破坏：艺策汇目录 `/var/www/yicehui`、`/opt/yicehui`，服务 `yicehui-docx.service`，域名 `yicehui.art`；龙虾目录 `/opt/openclaw`，服务 `openclaw-gateway.service`，本地端口 `127.0.0.1:18789`。除只读健康检查外，不得修改、删除、重启或覆盖这些系统的目录、服务和 Nginx 配置。
4. 云脉珍心部署只允许操作 `/var/www/HaloCare`、PM2 进程 `halocare-backend`、Nginx 配置 `halocare` 及其证书相关配置；如需重载共享 Nginx，必须先执行 `sudo nginx -t` 且不得改动其他站点配置。
5. 生产数据 `storage/` 和服务器端 `server/.env` 必须保留，不得被打包覆盖、提交到 GitHub 或写入文档。同步代码时应排除 `.env`、`.pem`、`storage/`、`node_modules/`、`dist/` 等本地/生产状态文件。
6. 自动部署由 `.github/workflows/deploy.yml` 和根目录 `deploy.sh` 共同承担，且只监听 `master` 分支：GitHub Actions 负责打包干净源码并上传到服务器，服务器端保留生产 `storage/` 与 `server/.env` 后执行 `deploy.sh` 构建、安装依赖并通过 PM2 重载后端。
7. GitHub Actions 需要配置仓库 Secrets：`SERVER_HOST=43.163.215.149`、`SERVER_USER=ubuntu`、`SERVER_SSH_KEY` 为 `Hongkong_ssh.pem` 对应私钥内容，可选 `SERVER_PORT=22`；不得把私钥明文写进仓库。
8. 每次部署后至少验证：`https://www.yunmai.life` 返回 200，`https://www.yunmai.life/api/test` 返回成功，`pm2 status halocare-backend` 正常，`nginx.service` 正常；同时只读确认 `https://yicehui.art`、`yicehui-docx.service`、`openclaw-gateway.service` 仍正常。

## UI 与动效硬性要求

1. 凡是新增或修改 UI，一律要加入符合物理直觉且高端雅气的动效；不得只做静态界面或只改颜色。
2. 动效规范以根目录 `design.md` 为准。UI 修改必须同步检查该文档是否需要更新。
3. 动效必须服务反馈、空间关系、状态变化或信息层级，不得添加无意义循环、夸张弹跳、频闪、震动、彩纸或强装饰性光效。
4. 所有新动效必须考虑 `prefers-reduced-motion: reduce`，至少降级为淡入淡出或即时状态变化。
5. 移动端触摸反馈应轻、短、准：按压压低或缩放，释放回稳；页面切换方向应符合导航来源；列表进入可小幅 stagger。
6. 医疗/健康内容页面不得让动效遮挡正文、报告结论、免责声明、输入框或主要按钮。

## 代码与样式约定

1. 优先沿用现有 React 函数组件、TypeScript 类型和 Tailwind class 写法。
2. 组件状态应清晰直接，避免为简单交互引入过重抽象。
3. 图标优先使用 `lucide-react`，不要手写等价 SVG。
4. 新增依赖前必须确认已有能力不足，并在 `package.json`、`package-lock.json` 和文档中说明用途。
5. 不要把 API Key、JWT Secret、`.env` 内容、`.pem` 私钥或真实用户数据写入代码、日志、截图或文档。
6. 注释只写必要的业务原因或复杂逻辑解释，不给显而易见的代码逐行注释。

## 验证要求

当前根 `package.json` 未提供 lint/test 脚本，不得在交付说明中声称已运行不存在的 lint/test。

建议按修改范围执行：

```powershell
# 前端或共享代码变更
npm.cmd run build

# 后端代码变更，至少做语法检查
cd D:\Program\盒家康智慧中医\server
node --check index.js
node --check db.js
```

如修改了依赖，先在对应目录运行 `npm.cmd install`。如无法完成构建、检查或必要的浏览器验证，交付说明必须明确写出原因。

## 交付说明要求

交付时应简明列出：

1. 本次改了什么。
2. 文档同步结果。
3. 已运行的验证命令和结果。
4. 未完成验证或存在风险时的具体原因。
