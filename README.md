# up-actions

一个用于 Tauri 项目的 GitHub Action，支持将构建文件复制到版本化发布目录，并可选地部署到 FTP 服务器。

## 功能特点

- 📦 自动从配置文件提取版本号
- 🗂️ 将构建文件复制到版本化目录（如 `v1.0.0/`）
- ☁️ 支持 FTP/S 部署到远程服务器
- � 自动生成/更新 `latest.json` 文件用于应用自动更新
- � 支持自定义 CDN 下载地址
- �🔐 安全处理敏感信息（使用 GitHub Secrets）
- 🎯 灵活的触发模式（disabled/ci/use）

## 快速开始

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
        uses: supbose/up-actions@latest
        with:
          enable-ftp: 'use'
          ftp-host: ${{ secrets.FTP_HOST }}
          ftp-username: ${{ secrets.FTP_USERNAME }}
          ftp-password: ${{ secrets.FTP_PASSWORD }}
          upload-latest: 'use'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## 输入参数

### 必选参数

> **注意**：没有绝对必需的参数，但某些参数在特定模式下是必需的，见下方说明。

| 参数名 | 必填 | 默认值 | 描述 |
|--------|:---:|--------|------|
| `source-dir` | ❌ | `src-tauri/target/release/bundle/` | 包含打包文件的源目录 |
| `target-root` | ❌ | `src-tauri/target/release/fabu/` | 发布文件的目标根目录 |
| `config-file` | ❌ | `src-tauri/tauri.conf.json` | Tauri 配置文件路径，用于提取版本号 |
| `enable-ftp` | ❌ | `disabled` | FTP 模式：`disabled`（禁用）、`ci`（外部步骤）、`use`（内置FTP） |
| `ftp-host` | ⚠️ | - | FTP 服务器地址（**当 `enable-ftp` 为 `use` 时必需**） |
| `ftp-username` | ⚠️ | - | FTP 用户名（**当 `enable-ftp` 为 `use` 时必需**） |
| `ftp-password` | ⚠️ | - | FTP 密码（**当 `enable-ftp` 为 `use` 时必需**） |
| `ftp-server-dir` | ❌ | `''` | FTP 服务器上的远程目录 |
| `upload-latest` | ❌ | `disabled` | 是否上传 latest.json：`disabled`、`ci`、`use` |
| `github-token` | ⚠️ | `''` | GitHub Token（**当 `upload-latest` 不为 `disabled` 时建议提供**） |
| `cdn-base-url` | ❌ | `https://cdn.ali.yiruan.wang/` | CDN 基础 URL，用于下载链接（需以 `/` 结尾） |

### 参数说明

#### `enable-ftp` 选项
- `disabled`：禁用 FTP 上传（默认）
- `ci`：由外部 CI 步骤处理 FTP 上传
- `use`：使用内置 FTP 功能上传，此时必须提供 FTP 凭据

#### `upload-latest` 选项
- `disabled`：不生成/上传 latest.json（默认）
- `ci`：由外部 CI 步骤处理 latest.json
- `use`：生成并上传 latest.json 到 FTP 服务器

#### `cdn-base-url`
自定义 CDN 下载地址，用于替换 latest.json 中的下载链接。
- 默认值：`https://cdn.ali.yiruan.wang/`
- 必须以 `/` 结尾（代码会自动处理）
- 完整下载路径格式：`{cdn-base-url}download/v{version}/`

## 输出参数

| 参数名 | 描述 |
|--------|------|
| `version` | 从配置文件提取的应用版本号 |
| `target-dir` | 版本化目标目录的完整路径 |
| `enable-ftp` | 当前 FTP 模式（disabled/ci/use） |
| `ftp-upload-success` | FTP 上传结果（disabled/external/true/false） |
| `latest-json-path` | 生成的 latest.json 文件路径 |

## 使用场景示例

### 场景 1：仅复制文件到版本化目录

```yaml
- name: Copy to Versioned Directory
  uses: supbose/up-actions@latest
  with:
    source-dir: 'src-tauri/target/release/bundle/'
    target-root: 'dist/'
```

### 场景 2：复制文件并部署到 FTP

```yaml
- name: Deploy to FTP
  uses: supbose/up-actions@latest
  with:
    enable-ftp: 'use'
    ftp-host: ${{ secrets.FTP_HOST }}
    ftp-username: ${{ secrets.FTP_USERNAME }}
    ftp-password: ${{ secrets.FTP_PASSWORD }}
    ftp-server-dir: '/public_html/app/'
```

### 场景 3：使用自定义 CDN

```yaml
- name: Deploy with Custom CDN
  uses: supbose/up-actions@latest
  with:
    enable-ftp: 'use'
    ftp-host: ${{ secrets.FTP_HOST }}
    ftp-username: ${{ secrets.FTP_USERNAME }}
    ftp-password: ${{ secrets.FTP_PASSWORD }}
    upload-latest: 'use'
    cdn-base-url: 'https://cdn.yourdomain.com/'
```

## 设置 Secrets

为了保护敏感信息，建议在仓库设置中添加以下 Secrets：

1. 进入仓库 **Settings > Secrets and variables > Actions**
2. 点击 "New repository secret" 添加：

| Secret 名称 | 说明 |
|-------------|------|
| `FTP_HOST` | FTP 服务器地址 |
| `FTP_USERNAME` | FTP 用户名 |
| `FTP_PASSWORD` | FTP 密码 |
| `GITHUB_TOKEN` | GitHub 访问令牌（推荐使用内置 token） |

## 工作流程说明

1. **初始化**：读取输入参数，验证配置
2. **版本提取**：从 `tauri.conf.json` 或 `package.json` 提取版本号
3. **文件复制**：将源目录文件复制到版本化目标目录（如 `fabu/v1.0.0/`）
4. **Latest.json 处理**：生成或更新 `latest.json`，替换下载链接为 CDN 地址
5. **FTP 上传**：如果启用，将文件上传到 FTP 服务器

## 开发指南

### 项目结构

```
.
├── src/
│   ├── main.ts          # 主入口文件
│   └── types.ts         # TypeScript 类型定义
├── dist/               # 编译输出目录
├── action.yml          # Action 配置文件
├── package.json        # 项目依赖和脚本定义
├── tsconfig.json       # TypeScript 配置
└── README.md           # 项目文档
```

### 构建命令

```bash
# 安装依赖
pnpm install

# 编译 TypeScript
pnpm build

# 打包为单一可执行文件
pnpm package

# 完整构建流程
pnpm build:full

# 开发模式（监听文件变化）
pnpm dev

# 清理构建产物
pnpm clean
```

### 核心依赖

| 依赖 | 说明 |
|------|------|
| `@actions/core` | Action 输入/输出和日志处理 |
| `@actions/github` | GitHub API 客户端 |
| `@samkirkland/ftp-deploy` | FTP 部署功能 |
| `@octokit/core` | GitHub REST API SDK |
| `dotenv` | 环境变量加载 |

### 版本管理

使用 `mbump` 管理版本：

```bash
pnpm mbump patch     # 补丁版本 (1.0.3 → 1.0.4)
pnpm mbump minor     # 次版本 (1.0.3 → 1.1.0)
pnpm mbump major     # 主版本 (1.0.3 → 2.0.0)
```

## 故障排除

### 常见问题

1. **版本号未正确提取**
   - 检查 `config-file` 路径是否正确
   - 确保配置文件中包含 `version` 字段

2. **FTP 连接失败**
   - 检查 FTP 服务器地址、端口、用户名和密码
   - 确保服务器支持被动模式（PASV）
   - 验证服务器防火墙设置

3. **文件上传不完整**
   - 检查源目录是否包含预期文件
   - 确认 FTP 用户有写入权限

4. **latest.json 未更新**
   - 确保 `upload-latest` 设置为 `use`
   - 检查 GitHub Token 权限

### 调试模式

添加环境变量启用详细日志：

```yaml
- name: Deploy with Debug Log
  uses: supbose/up-actions@latest
  with:
    enable-ftp: 'use'
    ftp-host: ${{ secrets.FTP_HOST }}
    ftp-username: ${{ secrets.FTP_USERNAME }}
    ftp-password: ${{ secrets.FTP_PASSWORD }}
  env:
    ACTIONS_STEP_DEBUG: true
```

## 许可证

本项目采用 ISC 许可证，详见 [LICENSE](./LICENSE) 文件。
