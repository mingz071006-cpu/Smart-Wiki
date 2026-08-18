# Smart Wiki

Smart Wiki 是一个面向局域网使用的综合知识与学习平台。项目从轻量 Wiki 起步，目前已经包含知识库、用户系统、评论互动、站内聊天、系统通知、Python 学习中心、网页游戏、实用工具箱、管理后台，以及 Windows 客户端服务管理器。

项目采用原生 HTML、CSS、JavaScript 和 Node.js 构建，没有引入前端框架。所有主要业务数据使用 JSON 文件保存，适合学习 Web 开发、在家庭或小型团队局域网中部署，也便于直接阅读和修改源代码。

## 当前版本

- 网站发布版本：由客户端管理器中的“版本管理”维护，当前运行版本以 `/api/site-version` 为准。
- Windows 客户端包版本：由 `package.json` 的 `version` 字段决定。
- 两者是不同概念。修改网站发布版本不会自动改变 EXE 文件名；重新打包 EXE 前应根据需要同步修改 `package.json`。
- 服务器默认端口：`3000`。
- 本机入口：`http://127.0.0.1:3000/`。

## 主要功能

### 知识库

- 按科技前沿、编程开发、网络安全、自然科学、健康医学、环境、历史、经济、文化、生活、数字金融和游戏百科等分类浏览。
- 支持全文搜索、分类筛选、精选推荐和阅读量统计。
- 搜索不到内容时记录“内容缺口”，向用户提供 Google 搜索入口，并在后台显示待补充主题。
- 支持管理员创建、编辑、发布、归档、删除及恢复文章。
- 支持文章配图、重点摘要、来源链接和历史版本。
- 精选内容综合近期阅读量、总阅读量、新鲜度和分类多样性计算。
- 自动内容收录任务每 10 分钟运行一次，并避免短时间重复发布。

### 用户与权限

- 支持注册、登录、退出和登录会话。
- 第一个注册用户自动成为超级管理员。
- 后续注册用户默认是普通用户。
- 超级管理员可以调整普通用户与管理员身份。
- 管理员可以重置普通用户密码为临时密码 `123456`。
- 用户使用临时密码登录后必须修改密码。
- 修改密码后会撤销该用户的全部登录会话并要求重新登录。
- 用户可以修改昵称，每 24 小时最多一次。
- 用户可以选择预设头像，或上传 JPG、PNG 自定义头像。
- 上传头像会在浏览器中居中裁剪为 256×256 并压缩，原始图片不会保存到服务器。

### 评论、关注与私信

- 登录用户可以在文章下发表评论和回复评论。
- 点击评论头像可以展开关注、回复和私信操作。
- 支持关注、取消关注、回关及互相关注状态。
- 未互相关注时，单方向最多向同一用户发送两条私信。
- 站内聊天采用联系人列表与聊天窗口布局。
- 手机端支持系统返回键、软键盘高度适配、安全区和触控优化。
- 系统通知、评论回复、关注提醒和私信通知分类显示。
- 系统通知不会错误显示“私信”操作；只有真实用户互动允许发起私信。
- 支持全部已读、清理已读通知、清理系统通知和清理自己的私信记录。

### Python 学习中心

- 面向初学者的分阶段课程路线。
- 侧面课本提供概念、步骤、提示和完整示例，用户需要自行输入代码。
- 浏览器内运行 Python，不依赖服务器执行用户代码。
- 支持语法高亮、行号、运行输出和练习验证。
- 支持学习进度保存、云端代码历史、下载和删除。

### 网页游戏

- 知识星球冲刺：躲避障碍、收集能量并逐渐提升难度。
- Smart Dino：类似浏览器离线小恐龙的跑酷游戏。
- Smart Surf：类似浏览器冲浪游戏的纵向躲避玩法。
- 手机和电脑均可游玩。
- 只有登录用户可以把成绩提交到服务器排行榜。
- Dino 与 Surf 已提供浅色、深色模式专用视觉样式。

### 实用工具箱

- Markdown 与 Word 相互转换。
- JSON 格式化、压缩和校验。
- 文本差异比较。
- 二维码生成。
- Base64 与 URL 编解码。
- 随机密码生成。
- 图片压缩。
- PDF 合并与拆分。
- 单位换算。
- 文件哈希校验。
- 全角与半角文字转换。
- 音频转换为 MP3、FLAC 或 WAV。
- 视频转 GIF。

部分大型媒体转换依赖浏览器加载的第三方运行库。无法联网时，知识库、账户、消息和大部分本地工具仍可工作，但依赖 CDN 的工具可能不可用。

### 管理后台

- 条目管理与文章搜索。
- 内容缺口处理。
- 用户列表、身份管理和密码重置。
- 建议审核与回收站。
- 操作日志和数据备份。
- 系统通知与管理员私信推送。
- 可以向全部用户或指定用户发送内容。

### Windows 客户端管理器

- 启动、停止和重新启动 Smart Wiki 服务器。
- 打开主页、后台、局域网二维码和数据目录。
- 隐藏到系统托盘并保持服务器后台运行。
- 查看服务器状态、日志、局域网地址和在线设备。
- 在线设备信息包含 IP、设备类型、浏览器和最近活动时间。
- 管理网站发布版本和更新说明。
- 发布新版本时向已有用户生成一次版本更新通知。
- 使用本地开发代码签名证书进行开发环境签名。

## 技术结构

```text
浏览器页面
   │
   ├── HTML：页面结构
   ├── CSS：主题、响应式布局和动画
   └── JavaScript：交互、状态与 API 请求
            │
            ▼
Node.js HTTP Server（server.mjs）
   │
   ├── 静态文件服务
   ├── 登录与权限检查
   ├── REST 风格 API
   ├── 自动内容收录
   └── JSON 文件读写队列
            │
            ▼
data/*.json 或 Electron userData/data/*.json
```

服务器使用 Node.js 内置模块，不依赖 Express：

- `node:http`：HTTP 服务。
- `node:crypto`：密码派生、随机会话令牌和安全比较。
- `node:fs/promises`：异步文件读写。
- `node:path`：路径校验与静态资源定位。
- `node:os`：读取局域网地址和网络接口。

密码通过随机盐和 `scrypt` 派生后保存，不存储明文密码。会话令牌保存在 `sessions.json`，默认有效期为七天。

## 项目目录

```text
mini-wiki/
├─ index.html                       网站主页
├─ server.mjs                      Node.js 服务端、API 和静态资源服务
├─ package.json                    npm 脚本、Electron 和打包配置
├─ pnpm-lock.yaml                  依赖锁定文件
├─ pnpm-workspace.yaml             pnpm 工作区配置
├─ README.md                       项目说明文档
├─ START-SMART-WIKI.cmd            脚本模式启动服务器
├─ STOP-SMART-WIKI.cmd             脚本模式停止服务器
├─ RESTART-SMART-WIKI.cmd          脚本模式重启服务器
├─ SMART-WIKI-MANAGER.cmd          打开 PowerShell 备用管理器
│
├─ pages/                          独立功能页面
│  ├─ about-changer.html           Changer+ 专栏
│  ├─ about-mycom.html             mycom+ 专栏
│  ├─ admin.html                   管理后台
│  ├─ arcade.html                  游戏中心
│  ├─ article.html                 文章详情与评论
│  ├─ change-password.html         修改密码
│  ├─ dino.html                    Smart Dino
│  ├─ game.html                    知识星球冲刺
│  ├─ knowledge.html               全部知识目录
│  ├─ lan.html                     局域网地址与二维码
│  ├─ login.html                   登录
│  ├─ messages.html                消息与聊天中心
│  ├─ profile.html                 用户个人中心
│  ├─ python-center.html           Python 学习中心
│  ├─ register.html                注册
│  ├─ surf.html                    Smart Surf
│  └─ tools.html                   实用工具箱
│
├─ css/                            页面样式
│  ├─ style.css                    全站基础样式和主要组件
│  ├─ advanced-ui.css              高级 UI、主题变量和响应式布局
│  ├─ motion-ui.css                页面动画与过渡效果
│  ├─ sidebar-lock.css             桌面侧边栏固定规则
│  ├─ topbar-actions.css           顶部账户操作栏
│  ├─ admin-push.css               后台消息推送面板
│  ├─ comments.css                 评论和互动菜单
│  ├─ messages-ui.css              桌面聊天界面
│  ├─ messages-mobile.css          手机聊天、键盘和安全区适配
│  ├─ avatar-display.css           全站头像显示
│  ├─ avatar-settings.css          头像选择与上传弹窗
│  ├─ arcade.css                   游戏中心
│  ├─ game.css                     知识星球冲刺
│  ├─ dino.css                     Smart Dino
│  ├─ surf.css                     Smart Surf
│  ├─ game-dark.css                Dino 与 Surf 深色模式修正
│  └─ python-center.css            Python 学习中心
│
├─ js/                             浏览器端逻辑
│  ├─ wiki-data.js                 全站数据、用户会话、主题和公共方法
│  ├─ app.js                       主页、搜索、导航和用户菜单
│  ├─ auth.js                      登录与注册
│  ├─ change-password.js           修改密码
│  ├─ profile.js                   用户资料、昵称和头像设置
│  ├─ admin.js                     管理后台
│  ├─ comments.js                  评论、回复、关注和私信入口
│  ├─ messages.js                  通知、会话、私信和手机聊天
│  ├─ python-center.js             Python 课程、编辑器和云端历史
│  ├─ arcade.js                    游戏中心
│  ├─ game.js                      知识星球冲刺逻辑
│  ├─ dino.js                      Smart Dino 逻辑
│  ├─ surf.js                      Smart Surf 逻辑
│  ├─ tools.js                     文档转换工具
│  ├─ mini-tools.js                轻量文本工具
│  ├─ utility-plus.js              图片、PDF、音视频等扩展工具
│  └─ extra-articles.js            前端兼容与扩展文章数据
│
├─ assets/                         图片、Logo 和图标
│  ├─ avatars/                     8 个 DiceBear Pixel Art 预设头像
│  ├─ mycom-logo.svg               mycom+ Logo
│  ├─ changer-icon.svg             Changer+ 图标
│  └─ *.svg                        分类、文章和专题配图
│
├─ data/                           开发/脚本模式的数据目录
│  ├─ articles.json                文章正文与元数据
│  ├─ article-stats.json           阅读量与近期访问数据
│  ├─ users.json                   用户、权限、密码哈希和头像
│  ├─ sessions.json                登录会话
│  ├─ comments.json                评论与回复
│  ├─ follows.json                 关注关系
│  ├─ direct-messages.json         私信记录
│  ├─ notifications.json           系统及互动通知
│  ├─ game-leaderboard.json        游戏排行榜
│  ├─ python-progress.json         Python 学习进度和云端代码
│  ├─ search-gaps.json             搜索内容缺口
│  ├─ site-settings.json           运行时版本和发布说明，首次发布后生成
│  └─ server.pid                   脚本服务进程记录
│
├─ desktop/                        Electron Windows 管理器
│  ├─ main.cjs                     主进程、服务器生命周期和托盘
│  ├─ preload.cjs                  安全的页面与主进程通信桥
│  ├─ manager.html                 管理器界面
│  ├─ manager.css                  管理器主样式
│  ├─ manager-version.css          版本管理样式
│  ├─ manager.js                   管理器前端逻辑
│  └─ assets/                      EXE 和托盘图标
│
├─ scripts/                        服务、构建和辅助脚本
│  ├─ smart-wiki-service.ps1       后台服务启动、停止和状态检查
│  ├─ smart-wiki-manager.ps1       PowerShell 备用图形管理器
│  ├─ ENABLE-LAN-FIREWALL.cmd      Windows 局域网防火墙配置
│  └─ generate-desktop-icons.cjs   生成桌面 PNG 与 ICO 图标
│
├─ dist-desktop/                   Electron 构建产物，不手工修改
├─ node_modules/                   安装的开发依赖，不手工修改
├─ legacy/                         旧示例或迁移参考
└─ mini-wiki/                      历史嵌套副本，当前根目录服务不会读取
```

### 关于嵌套的 `mini-wiki/` 目录

当前有效项目是本 README 所在的根目录。根目录内还有一个同名 `mini-wiki/` 文件夹，它是整理目录前保留的历史副本。正常开发、运行和打包均不应修改该嵌套目录，否则修改不会出现在当前服务器或 EXE 中。

在确认不再需要历史对照并完成备份前，不要直接删除它。

## 数据保存位置

### 脚本或开发模式

直接运行 `server.mjs` 时，数据默认保存在：

```text
C:\codex学习\mini-wiki\data\
```

### Windows EXE 模式

通过 Electron 客户端运行时，程序把数据放在 Electron 用户数据目录：

```text
%APPDATA%\smart-wiki\data\
```

在当前电脑上通常是：

```text
C:\Users\<用户名>\AppData\Roaming\smart-wiki\data\
```

EXE 第一次运行时，会把打包时的 `data/` 作为种子数据复制到用户数据目录。之后重新打包不会覆盖已经存在的用户数据。

也可以通过环境变量指定其他数据目录：

```powershell
$env:SMART_WIKI_DATA_DIR = "D:\SmartWikiData"
node server.mjs
```

## 启动方式

### 方式一：Windows 客户端

运行：

```text
dist-desktop\Smart-Wiki-Server-Manager-1.0.2.exe
```

客户端会自动启动服务器。关闭窗口时可以选择隐藏到托盘，或停止服务器并退出。

### 方式二：批处理脚本

双击：

```text
START-SMART-WIKI.cmd
```

停止和重启分别使用：

```text
STOP-SMART-WIKI.cmd
RESTART-SMART-WIKI.cmd
```

### 方式三：命令行开发模式

```powershell
pnpm install
pnpm start
```

也可以直接运行：

```powershell
node server.mjs
```

## 局域网访问

1. 让服务器电脑与手机连接同一个路由器或 Wi-Fi。
2. 启动 Smart Wiki。
3. 在管理器中点击“手机二维码”，或访问 `/lan.html`。
4. 手机扫码或输入显示的局域网地址。
5. 如果无法访问，以管理员身份运行 `scripts/ENABLE-LAN-FIREWALL.cmd` 配置 Windows 防火墙。

服务器监听 `0.0.0.0:3000`，因此同一局域网设备可以连接。不要把端口直接暴露到公网；当前项目定位为可信局域网服务，不是经过公网安全加固的生产系统。

## 页面地址兼容

真实页面位于 `pages/`，但服务器保留了根地址兼容映射：

- `/admin.html` 映射到 `pages/admin.html`。
- `/messages.html` 映射到 `pages/messages.html`。
- `/style.css` 映射到 `css/style.css`。
- `/app.js` 映射到 `js/app.js`。

因此现有链接和浏览器书签不需要改成 `/pages/...`。如果全部页面都返回 404，但 `/api/health` 正常，应检查 EXE 解压后的 `resources/wiki/` 是否包含 `index.html`、`pages/`、`css/` 和 `js/`。

## 主要 API

以下接口由 `server.mjs` 提供。需要身份验证的接口通过请求头传递：

```http
Authorization: Bearer <session-token>
Content-Type: application/json
```

### 服务与配置

| 方法 | 地址 | 作用 |
|---|---|---|
| GET | `/api/health` | 服务健康状态、运行时间和版本 |
| GET | `/api/network-info` | 局域网地址 |
| GET | `/api/online-devices` | 在线设备，仅服务器本机 |
| POST | `/api/server/shutdown` | 关闭服务，仅服务器本机 |
| GET | `/api/site-version` | 当前网站发布版本 |
| POST | `/api/site-version` | 发布版本和通知，仅服务器本机 |
| GET | `/api/featured` | 阅读热度精选文章 |
| GET | `/api/auto-publish/status` | 自动内容收录状态 |

### 账户

| 方法 | 地址 | 作用 |
|---|---|---|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 读取当前用户 |
| POST | `/api/auth/change-password` | 修改密码并撤销会话 |
| POST | `/api/auth/change-name` | 修改昵称 |
| POST | `/api/auth/avatar` | 修改预设或自定义头像 |
| GET | `/api/users` | 管理员读取用户列表 |
| PUT | `/api/users` | 超级管理员更新用户角色 |
| POST | `/api/users/:id/reset-password` | 超级管理员重置密码 |

### 内容与互动

| 方法 | 地址 | 作用 |
|---|---|---|
| GET | `/api/articles` | 获取文章 |
| PUT | `/api/articles` | 管理员保存文章 |
| POST | `/api/articles/:id/view` | 记录阅读量 |
| GET/POST | `/api/comments` | 获取或发表评论 |
| GET/POST | `/api/follows`、`/api/follows/:id` | 查看和切换关注状态 |
| GET/POST/DELETE | `/api/direct-messages` | 私信读取、发送和清理 |
| GET | `/api/notifications` | 读取通知 |
| PUT | `/api/notifications/read` | 标记通知已读 |
| DELETE | `/api/notifications` | 按范围清理通知 |
| POST | `/api/admin/push` | 管理员推送系统消息或私信 |

### 学习与游戏

| 方法 | 地址 | 作用 |
|---|---|---|
| GET/PUT/DELETE | `/api/python-progress` | Python 学习进度与历史 |
| GET | `/api/game/leaderboard` | 按游戏读取排行榜 |
| POST | `/api/game/score` | 登录用户提交成绩 |
| GET/POST | `/api/search-gaps` | 管理和报告内容缺口 |

## 常用修改位置

| 想修改的内容 | 主要文件 |
|---|---|
| 首页布局 | `index.html`、`css/style.css`、`js/app.js` |
| 文章内容 | `data/articles.json`，或使用管理后台 |
| 全站配色和深浅色变量 | `css/advanced-ui.css` |
| 手机聊天 | `css/messages-mobile.css`、`js/messages.js` |
| Dino / Surf 深色模式 | `css/game-dark.css` |
| 用户头像 | `js/profile.js`、`css/avatar-settings.css`、`server.mjs` |
| 评论互动 | `js/comments.js`、`css/comments.css` |
| Python 课程 | `js/python-center.js` |
| 游戏规则 | `js/game.js`、`js/dino.js`、`js/surf.js` |
| 工具箱 | `pages/tools.html`、`js/tools.js`、`js/mini-tools.js`、`js/utility-plus.js` |
| 后台 | `pages/admin.html`、`js/admin.js`、`css/admin-push.css` |
| API 和数据持久化 | `server.mjs` |
| Windows 管理器 | `desktop/` |

## Windows 客户端开发与打包

开发模式：

```powershell
pnpm desktop
```

生成图标：

```powershell
pnpm icons
```

构建 Windows 便携 EXE：

```powershell
pnpm build:win
```

输出目录：

```text
dist-desktop/
```

### 本地开发证书签名注意事项

项目当前使用主题为 `CN=Smart Wiki Local Development` 的本地开发代码签名证书。它只用于开发环境，不冒充公开证书机构。

便携 EXE 必须在 Electron Builder 打包过程中签名。不要在便携 EXE 生成后再使用 `Set-AuthenticodeSignature` 追加签名，否则可能破坏便携包的资源解压，表现为 API 正常但所有页面返回“页面不存在”。

正式分发时应购买可信代码签名证书，并在安全的构建环境中配置 `CSC_LINK` 与 `CSC_KEY_PASSWORD`。私钥和密码不得提交到 Git。

## 数据安全与备份

建议定期备份整个运行时 `data/` 目录，尤其是：

- `users.json`
- `articles.json`
- `comments.json`
- `direct-messages.json`
- `notifications.json`
- `python-progress.json`
- `site-settings.json`

注意事项：

- `users.json` 包含密码派生结果和盐，虽然不是明文密码，仍属于敏感数据。
- `sessions.json` 包含有效登录令牌，不应共享或提交到公开仓库。
- `direct-messages.json` 和 `notifications.json` 可能包含私人内容。
- 自定义头像以压缩后的 Data URL 保存在用户记录中，因此大量上传会增大 `users.json`。
- 不要使用文本编辑器在服务器运行期间同时覆盖正在写入的 JSON 文件。
- 修改前先复制备份，确保 JSON 语法正确。

## 安全边界

- 项目适合本机和可信局域网，不建议直接公开到互联网。
- API 会限制跨站来源，并对管理权限进行检查。
- 服务器本机专用接口会验证请求 IP。
- 上传头像仅接受预设路径或浏览器生成的 PNG/JPEG Data URL，并限制体积。
- 用户上传图片仍应视为不可信内容；页面只把它作为图片来源显示。
- 浏览器内 Python 运行环境不会在服务器执行用户代码。
- 对公网部署前还需要 HTTPS、反向代理、速率限制、安全日志、数据库、文件上传隔离和更严格的内容安全策略。

## 故障排查

### 页面显示“页面不存在”

1. 访问 `/api/health` 检查服务器是否在线。
2. 如果 API 正常而全部 HTML/CSS/JS 都是 404，检查 EXE 的 `resources/wiki/` 是否完整。
3. 确认便携 EXE 没有在打包完成后被二次追加签名。
4. 使用正确签名流程重新打包并重启客户端。

### 登录、消息、成绩和云端保存同时失败

这通常不是四个功能同时损坏，而是服务器没有数据目录写入权限。检查：

- 数据目录是否存在。
- 当前进程是否有写入权限。
- 是否通过受限环境启动服务器。
- JSON 文件是否被其他程序长期锁定。

### EXE 双击没有反应

- 检查 Windows 应用控制或 Smart App Control 是否拦截未签名程序。
- 检查签名状态和证书主题。
- 查看系统托盘中是否已有管理器实例。
- 便携 EXE 首次启动需要解压，可能比普通程序慢。

### 手机无法访问

- 确认手机和电脑位于同一 Wi-Fi。
- 使用管理器显示的局域网 IP，不要在手机输入 `127.0.0.1`。
- 检查 Windows 防火墙是否允许端口 3000。
- 某些访客 Wi-Fi 会隔离设备，需切换到普通局域网。

### 深色模式内容看不清

- 检查页面是否加载 `advanced-ui.css`。
- Dino 与 Surf 还需要 `game-dark.css`。
- 清除浏览器缓存或使用强制刷新。

## 开发约定

- 修改真实源文件，不要修改 `dist-desktop/` 中的构建产物。
- 不要修改根目录中的历史嵌套 `mini-wiki/` 副本。
- 新页面放入 `pages/`，样式放入 `css/`，交互逻辑放入 `js/`。
- 用户数据结构变化应保持旧数据兼容。
- 新增写操作时使用服务器现有的 JSON 写入队列，避免并发覆盖。
- 新增 API 时验证方法、身份、权限、输入长度和数据类型。
- 新增移动端界面时同时检查窄屏、横屏、软键盘和安全区域。
- 打包前执行 JavaScript 语法检查，并在构建后验证 `/api/health`、主页和关键资源。

## 第三方资源

- 预设头像使用 DiceBear Pixel Art 风格，许可证为 CC0。
- Word、PDF、二维码和媒体转换页面可能使用各自的浏览器端开源库。
- 自动收录的百科内容应保留来源和许可信息。
- mycom+ 与 Changer+ 的品牌资源仅用于对应专题介绍，使用范围应遵循品牌方要求。

## 未来可改进方向

- 将 JSON 数据迁移到 SQLite 或 PostgreSQL。
- 增加头像可视化裁剪位置调整。
- 为消息系统增加 WebSocket 实时推送。
- 增加通知偏好和用户隐私设置。
- 为文章编辑器增加服务端图片上传与媒体库。
- 增加自动化测试和 API 回归测试。
- 使用正式代码签名证书和安装程序。
- 增加 HTTPS、反向代理和公网部署配置。

---

Smart Wiki 的目标是把知识阅读、互动、学习、工具和轻量娱乐整合到一个清晰、易维护的局域网平台中。
