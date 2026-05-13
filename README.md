# tauri-actions

一个用于 Tauri 项目的 GitHub Action，支持将构建文件复制到版本化发布目录，并可选地部署到 FTP 服务器。

## 🚀 功能特点

- 📦 **自动版本提取**: 从 `tauri.conf.json` 或 `package.json` 自动提取版本号
- 🗂️ **版本化目录**: 将构建文件复制到版本化目录（如 `v1.0.0/`）
- ☁️ **FTP 部署**: 支持 FTP/S 部署到远程服务器
- 📋 **自动更新支持**: 自动生成/更新 `latest.json` 文件用于应用自动更新
- 🔗 **CDN 集成**: 支持自定义 CDN 下载地址
- 🔐 **安全处理**: 敏感信息使用 GitHub Secrets 管理
- ⏰ **时区支持**: 支持自定义时区生成 `pub_date`
- 🎯 **灵活模式**: 支持 disabled/ci/use 三种触发模式

## 📖 快速开始

### 基础配置示例

在你的仓库中创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy Tauri App
on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Build Tauri App
        uses: tauri-apps/tauri-action@v0

      - name: Deploy to FTP
        uses: supbose/tauri-actions@latest
        with:
          enable-ftp: 'use'
          ftp-host: ${{ secrets.FTP_HOST }}
          ftp-username: ${{ secrets.FTP_USERNAME }}
          ftp-password: ${{ secrets.FTP_PASSWORD }}
          upload-latest: 'use'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## ⚙️ 输入参数

### 参数列表

| 参数名 | 必填 | 默认值 | 描述 |
|--------|:---:|--------|------|
| `source-dir` | ❌ | `src-tauri/target/release/bundle/` | 包含打包文件的源目录 |
| `target-root` | ❌ | `src-tauri/target/release/fabu/` | 发布文件的目标根目录 |
| `config-file` | ❌ | `src-tauri/tauri.conf.json` | Tauri 配置文件路径，用于提取版本号 |
| `filter-by-version` | ❌ | `true` | 是否只复制符合当前版本号的文件到指定目录 |
| `enable-ftp` | ❌ | `disabled` | FTP 模式：`disabled`、`ci`、`use` |
| `ftp-host` | ⚠️ | - | FTP 服务器地址（`enable-ftp` 为 `use` 时必需） |
| `ftp-username` | ⚠️ | - | FTP 用户名（`enable-ftp` 为 `use` 时必需） |
| `ftp-password` | ⚠️ | - | FTP 密码（`enable-ftp` 为 `use` 时必需） |
| `ftp-server-dir` | ❌ | `''` | FTP 服务器上的远程目录 |
| `upload-latest` | ❌ | `disabled` | 是否上传 latest.json：`disabled`、`ci`、`use` |
| `github-token` | ⚠️ | `''` | GitHub Token（`upload-latest` 不为 `disabled` 时建议提供） |
| `cdn-base-url` | ❌ | `https://cdn.ali.yiruan.wang/` | CDN 基础 URL，用于下载链接 |
| `timezone` | ❌ | `Asia/Shanghai` | `latest.json` 中 `pub_date` 的时区 |

### 参数详细说明

#### `filter-by-version`

控制是否只复制包含当前版本号的文件。

- 默认值：`true`
- 当设置为 `true` 时，只复制文件名中包含当前版本号的文件
- 当设置为 `false` 时，复制所有文件
- 示例：版本号为 `1.0.0`，文件 `app_1.0.0_x64.exe` 会被复制，而 `app_0.9.0_x64.exe` 会被跳过

#### `enable-ftp` 选项

| 值 | 说明 |
|----|------|
| `disabled` | 禁用 FTP 上传（默认） |
| `ci` | 由外部 CI 步骤处理 FTP 上传 |
| `use` | 使用内置 FTP 功能上传，必须提供 FTP 凭据 |

#### `upload-latest` 选项

| 值 | 说明 |
|----|------|
| `disabled` | 不生成/上传 latest.json（默认） |
| `ci` | 由外部 CI 步骤处理 latest.json |
| `use` | 生成并上传 latest.json 到 FTP 服务器的 `updater/` 目录 |

#### `cdn-base-url`

自定义 CDN 下载地址，用于替换 `latest.json` 中的下载链接。

- 默认值：`https://cdn.ali.yiruan.wang/`
- 必须以 `/` 结尾（代码会自动处理）
- 完整下载路径格式：`{cdn-base-url}download/v{version}/`

#### `timezone`

设置 `latest.json` 中 `pub_date` 字段的时区。

- 默认值：`Asia/Shanghai`
- 支持标准 IANA 时区标识符
- 示例值：`UTC`, `America/New_York`, `Europe/London`, `Asia/Tokyo`

## 📤 输出参数

| 参数名 | 描述 |
|--------|------|
| `version` | 从配置文件提取的应用版本号 |
| `target-dir` | 版本化目标目录的完整路径 |
| `enable-ftp` | 当前 FTP 模式（disabled/ci/use） |
| `ftp-upload-success` | FTP 上传结果（disabled/external/true/false） |
| `latest-json-path` | 生成的 latest.json 文件路径 |
| `latest-upload-success` | latest.json 上传结果（true/false） |

## 📝 使用场景示例

### 场景 1：仅复制文件到版本化目录

```yaml
- name: Copy to Versioned Directory
  uses: supbose/tauri-actions@latest
  with:
    source-dir: 'src-tauri/target/release/bundle/'
    target-root: 'dist/'
```

### 场景 2：复制文件并部署到 FTP

```yaml
- name: Deploy to FTP
  uses: supbose/tauri-actions@latest
  with:
    enable-ftp: 'use'
    ftp-host: ${{ secrets.FTP_HOST }}
    ftp-username: ${{ secrets.FTP_USERNAME }}
    ftp-password: ${{ secrets.FTP_PASSWORD }}
    ftp-server-dir: '/public_html/app/'
```

### 场景 3：使用自定义 CDN 和时区

```yaml
- name: Deploy with Custom CDN
  uses: supbose/tauri-actions@latest
  with:
    enable-ftp: 'use'
    ftp-host: ${{ secrets.FTP_HOST }}
    ftp-username: ${{ secrets.FTP_USERNAME }}
    ftp-password: ${{ secrets.FTP_PASSWORD }}
    upload-latest: 'use'
    cdn-base-url: 'https://cdn.yourdomain.com/'
    timezone: 'America/New_York'
```

### 场景 4：仅生成 latest.json（不上传 FTP）

```yaml
- name: Generate latest.json
  uses: supbose/tauri-actions@latest
  with:
    upload-latest: 'use'
    github-token: ${{ secrets.GITHUB_TOKEN }}
    cdn-base-url: 'https://cdn.yourdomain.com/'
```

## 🔐 设置 Secrets

为了保护敏感信息，建议在仓库设置中添加以下 Secrets：

1. 进入仓库 **Settings > Secrets and variables > Actions**
2. 点击 "New repository secret" 添加：

| Secret 名称 | 说明 |
|-------------|------|
| `FTP_HOST` | FTP 服务器地址 |
| `FTP_USERNAME` | FTP 用户名 |
| `FTP_PASSWORD` | FTP 密码 |
| `GITHUB_TOKEN` | GitHub 访问令牌（推荐使用内置 token） |

## 🔄 工作流程说明

```
┌─────────────────────────────────────────────────────────────┐
│                      初始化阶段                             │
│  1. 读取输入参数                                            │
│  2. 验证配置有效性                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      版本提取阶段                           │
│  1. 读取 tauri.conf.json 或 package.json                    │
│  2. 提取 version 字段                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      文件复制阶段                           │
│  1. 创建版本化目录（如 fabu/v1.0.0/）                        │
│  2. 复制源目录文件到目标目录                                 │
│  3. 按版本号过滤文件（可选）                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Latest.json 处理阶段                      │
│  1. 直接生成新的 latest.json                                │
│  2. 构建 platforms 对象（包含各平台下载链接和签名）            │
│  3. 设置 pub_date（支持自定义时区）                          │
│  4. 设置 notes（从 GitHub 提交信息获取）                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      FTP 上传阶段                            │
│  1. 上传版本化目录文件到 download/v{version}/               │
│  2. 上传 latest.json 到 updater/                            │
└─────────────────────────────────────────────────────────────┘
```

## 📁 项目结构

```
tauri-actions/
├── src/
│   ├── main.ts          # 主入口文件
│   ├── types.ts         # TypeScript 类型定义
│   └── utils/           # 工具模块目录
│       ├── files.ts     # 文件系统操作
│       ├── ftp.ts       # FTP 上传功能
│       ├── github.ts    # GitHub API 交互
│       ├── latest.ts    # latest.json 处理
│       ├── platform.ts  # 平台键生成
│       ├── utils.ts     # 通用工具函数
│       └── version.ts   # 版本处理
├── dist/                # 编译输出目录
├── action.yml           # GitHub Action 配置
├── package.json         # 项目依赖和脚本
├── tsconfig.json        # TypeScript 配置
├── LICENSE              # 许可证文件
└── README.md            # 项目文档
```

## 🛠️ 开发指南

### 环境要求

- Node.js >= 16.x
- pnpm >= 7.x

### 安装依赖

```bash
pnpm install
```

### 构建命令

```bash
# 编译 TypeScript
pnpm build

# 打包为单一可执行文件（用于 GitHub Action）
pnpm package

# 完整构建流程（编译 + 打包 + 版本更新）
pnpm build:full

# 开发模式（监听文件变化）
pnpm dev

# 清理构建产物
pnpm clean
```

### 核心依赖

| 依赖 | 版本 | 说明 |
|------|------|------|
| `@actions/core` | ^3.0.1 | GitHub Action 核心库 |
| `@actions/github` | ^9.1.1 | GitHub API 客户端 |
| `@octokit/core` | ^7.0.6 | GitHub REST API SDK |
| `@samkirkland/ftp-deploy` | ^1.2.5 | FTP 部署功能 |
| `dotenv` | ^17.4.2 | 环境变量加载 |

### 版本管理

使用 `mbump` 管理版本：

```bash
pnpm mbump patch     # 补丁版本 (1.0.3 → 1.0.4)
pnpm mbump minor     # 次版本 (1.0.3 → 1.1.0)
pnpm mbump major     # 主版本 (1.0.3 → 2.0.0)
```

## 🐛 故障排除

### 常见问题

#### 1. 版本号未正确提取

**原因**：配置文件路径错误或配置文件中缺少 `version` 字段

**解决方法**：
- 检查 `config-file` 参数路径是否正确
- 确保配置文件中包含 `version` 字段
- 支持的配置路径：`version`（根级别）或 `package.version`

#### 2. FTP 连接失败

**原因**：FTP 凭据错误、服务器不可达或防火墙阻止

**解决方法**：
- 检查 FTP 服务器地址、用户名和密码
- 确保服务器支持被动模式（PASV）
- 验证服务器防火墙设置
- 确认服务器端口（默认 21）未被阻止

#### 3. 文件上传不完整

**原因**：源目录文件缺失、权限不足或网络中断

**解决方法**：
- 检查源目录是否包含预期文件
- 确认 FTP 用户有写入权限
- 检查网络连接稳定性

#### 4. latest.json 未上传

**原因**：配置错误或 GitHub Token 权限不足

**解决方法**：
- 确保 `upload-latest` 设置为 `use`
- 检查 GitHub Token 是否具有 `repo` 权限
- 验证 `cdn-base-url` 格式正确

#### 5. 时区设置不生效

**原因**：时区标识符不正确

**解决方法**：
- 使用标准 IANA 时区标识符
- 常见时区：`Asia/Shanghai`, `UTC`, `America/New_York`, `Europe/London`

### 调试模式

添加环境变量启用详细日志：

```yaml
- name: Deploy with Debug Log
  uses: supbose/tauri-actions@latest
  with:
    enable-ftp: 'use'
    ftp-host: ${{ secrets.FTP_HOST }}
    ftp-username: ${{ secrets.FTP_USERNAME }}
    ftp-password: ${{ secrets.FTP_PASSWORD }}
  env:
    ACTIONS_STEP_DEBUG: true
```

## 📊 latest.json 格式

生成的 `latest.json` 文件格式如下：

```json
{
  "version": "1.0.0",
  "notes": "Bug fixes and performance improvements",
  "pub_date": "2024-01-15T10:30:00+08:00",
  "platforms": {
    "windows-x86_64": {
      "url": "https://cdn.example.com/download/v1.0.0/app_1.0.0_x64_en-US.msi",
      "signature": "abc123..."
    },
    "windows-x86_64-nsis": {
      "url": "https://cdn.example.com/download/v1.0.0/app_1.0.0_x64_en-US-setup.exe",
      "signature": "def456..."
    }
  }
}
```

## 📄 许可证

本项目采用 ISC 许可证，详见 [LICENSE](./LICENSE) 文件。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交规范

- 使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- 提交信息格式：`type(scope): description`
- 常见类型：`feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### 开发流程

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/my-feature`
3. 提交更改：`git commit -m "feat: add new feature"`
4. 推送到分支：`git push origin feature/my-feature`
5. 创建 Pull Request

## 📞 支持

如果您遇到问题或有任何疑问，请创建 [Issue](https://github.com/supbose/tauri-actions/issues)。

---

**Made with ❤️ for Tauri Community**
