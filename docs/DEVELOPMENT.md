# tauri-actions 开发文档

## 📋 目录

1. [项目概述](#项目概述)
2. [架构设计](#架构设计)
3. [代码结构](#代码结构)
4. [API 参考](#api参考)
5. [开发工作流](#开发工作流)
6. [测试流程](#测试流程)
7. [部署流程](#部署流程)
8. [优化建议](#优化建议)
9. [安全注意事项](#安全注意事项)

---

## 1. 项目概述

### 1.1 项目定位

`tauri-actions` 是一个 GitHub Action，专为 Tauri 项目设计，提供以下核心功能：

- 版本化文件管理
- FTP 部署
- 自动更新支持（latest.json 生成）

### 1.2 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| TypeScript | ^5.9.3 | 主要开发语言 |
| Node.js | >= 16.x | 运行时环境 |
| @actions/core | ^3.0.1 | GitHub Action 核心库 |
| @actions/github | ^9.1.1 | GitHub API 交互 |
| @octokit/core | ^7.0.6 | GitHub REST API |
| @samkirkland/ftp-deploy | ^1.2.5 | FTP 部署 |
| esbuild | ^0.28.0 | 打包工具 |

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Action Runtime                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      src/main.ts                               │
│               (入口文件 - 工作流编排)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  version.ts     │ │   files.ts      │ │    ftp.ts       │
│  (版本提取)      │ │  (文件操作)      │ │  (FTP部署)      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                   ┌─────────────────┐
                   │   latest.ts     │
                   │ (latest.json处理)│
                   └─────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   github.ts     │ │  platform.ts    │ │    utils.ts     │
│  (GitHub API)   │ │  (平台键生成)    │ │  (通用工具)      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 2.2 模块职责

| 模块 | 职责 | 核心功能 |
|------|------|----------|
| `main.ts` | 主入口 | 工作流编排、输入输出管理 |
| `types.ts` | 类型定义 | 全局类型和接口定义 |
| `version.ts` | 版本处理 | 从配置文件提取版本号 |
| `files.ts` | 文件操作 | 文件复制、目录遍历 |
| `ftp.ts` | FTP 部署 | 文件上传到 FTP 服务器 |
| `github.ts` | GitHub API | Release、Commit 信息获取 |
| `latest.ts` | Latest.json | 生成/更新 latest.json |
| `platform.ts` | 平台键 | 生成 Tauri 平台标识符 |
| `utils.ts` | 通用工具 | 日期格式化、字符串处理等 |

### 2.3 核心工作流

```
初始化 → 版本提取 → 文件复制 → latest.json 生成 → FTP 上传
```

---

## 3. 代码结构

### 3.1 目录结构

```
src/
├── main.ts              # 主入口
├── types.ts             # 类型定义
└── utils/
    ├── files.ts         # 文件系统操作
    ├── ftp.ts           # FTP 部署
    ├── github.ts        # GitHub API
    ├── latest.ts        # latest.json 处理
    ├── platform.ts      # 平台键生成
    ├── utils.ts         # 通用工具函数
    └── version.ts       # 版本处理
```

### 3.2 文件详细说明

#### 3.2.1 main.ts

**职责**：GitHub Action 主入口，编排整个工作流程

**核心流程**：
1. 读取输入参数
2. 初始化环境
3. 提取版本号
4. 复制文件到版本化目录
5. 处理 latest.json
6. 执行 FTP 上传
7. 设置输出参数

#### 3.2.2 types.ts

**职责**：定义项目全局类型和接口

**主要接口**：

| 接口名 | 说明 |
|--------|------|
| `ActionInputs` | Action 输入参数类型 |
| `FtpConfig` | FTP 配置类型 |
| `RepositoryInfo` | 仓库信息 |
| `Release` | GitHub Release 信息 |
| `ReleaseAsset` | Release 资产 |
| `LatestJsonContent` | latest.json 结构 |
| `Platforms` | 平台下载信息 |
| `DeploymentResult` | 部署结果 |

#### 3.2.3 utils/version.ts

**职责**：从配置文件提取版本号

**核心函数**：
- `extractVersion(configFile: string): string` - 从配置文件提取版本

#### 3.2.4 utils/files.ts

**职责**：文件系统操作

**核心函数**：
- `getAllFiles(dir: string): string[]` - 获取目录下所有文件
- `copyFiles(sourceDir: string, targetDir: string, version?: string): void` - 复制文件

#### 3.2.5 utils/ftp.ts

**职责**：FTP 部署功能

**核心函数**：
- `uploadToFTP(localDir: string, ftpConfig: FtpConfig): Promise<DeploymentResult>` - 上传文件到 FTP

#### 3.2.6 utils/github.ts

**职责**：GitHub API 交互

**核心函数**：
- `initializeToken(): void` - 初始化 GitHub Token
- `getRepositoryInfo(): RepositoryInfo` - 获取仓库信息
- `getLatestRelease(repoInfo: RepositoryInfo): Promise<Release | undefined>` - 获取最新 Release
- `getReleaseByTag(repoInfo: RepositoryInfo, tagName: string): Promise<Release | undefined>` - 按标签获取 Release
- `getReleaseAssetContent(repoInfo: RepositoryInfo, asset: ReleaseAsset): Promise<string>` - 获取资产内容
- `getGitCommitMessage(repoInfo: RepositoryInfo): Promise<string>` - 获取最新提交信息

#### 3.2.7 utils/latest.ts

**职责**：latest.json 生成和更新

**核心函数**：
- `updateAndUploadLatestJson(release, targetVersion, localUploadDir, repoInfo, cdnBase, ftpConfig, timezone)` - 生成并上传 latest.json
- `buildPlatformsFromAssets(release, downloadUrl, localUploadDir, repoInfo)` - 构建 platforms 对象

#### 3.2.8 utils/platform.ts

**职责**：生成 Tauri 平台标识符

**核心函数**：
- `getPlatformKey(fileName: string): string | undefined` - 根据文件名获取平台键

#### 3.2.9 utils/utils.ts

**职责**：通用工具函数

**核心函数**：

| 函数名 | 说明 |
|--------|------|
| `formatDateTimeWithTimezone(date, timezone)` | 带时区的日期格式化 |
| `ensureTrailingSlash(str)` | 确保以 `/` 结尾 |
| `safeJsonParse(str, fallback)` | 安全解析 JSON |
| `safeJsonStringify(obj, fallback)` | 安全字符串化 JSON |
| `retry(fn, options)` | 带重试的异步执行 |
| `debounce(fn, delay)` | 防抖函数 |
| `throttle(fn, limit)` | 节流函数 |

---

## 4. API 参考

### 4.1 类型定义

#### 4.1.1 ActionInputs

```typescript
interface ActionInputs {
  sourceDir: string;           // 源目录
  targetRoot: string;          // 目标根目录
  configFile: string;          // 配置文件路径
  enableFtp: 'disabled' | 'ci' | 'use';  // FTP 模式
  ftpHost: string;             // FTP 主机
  ftpUsername: string;         // FTP 用户名
  ftpPassword: string;         // FTP 密码
  ftpServerDir: string;        // FTP 远程目录
  uploadLatest: 'disabled' | 'ci' | 'use';  // latest.json 模式
  githubToken: string;         // GitHub Token
  cdnBaseUrl: string;          // CDN 基础 URL
  timezone: string;            // 时区
}
```

#### 4.1.2 FtpConfig

```typescript
interface FtpConfig {
  host: string;
  user: string;
  password: string;
  serverDir: string;
}
```

#### 4.1.3 LatestJsonContent

```typescript
interface LatestJsonContent {
  version: string;
  notes: string;
  pub_date: string;
  platforms: Platforms;
}

interface Platforms {
  [key: string]: PlatformInfo;
}

interface PlatformInfo {
  url: string;
  signature: string;
}
```

### 4.2 核心函数签名

#### 4.2.1 version.ts

```typescript
export function extractVersion(configFile: string): string;
```

#### 4.2.2 files.ts

```typescript
export function getAllFiles(dir: string): string[];
export function copyFiles(sourceDir: string, targetDir: string, version?: string): void;
```

#### 4.2.3 ftp.ts

```typescript
export async function uploadToFTP(localDir: string, ftpConfig: FtpConfig): Promise<DeploymentResult>;
```

#### 4.2.4 github.ts

```typescript
export function initializeToken(): void;
export function getRepositoryInfo(): RepositoryInfo;
export async function getLatestRelease(repoInfo: RepositoryInfo): Promise<Release | undefined>;
export async function getReleaseByTag(repoInfo: RepositoryInfo, tagName: string): Promise<Release | undefined>;
export async function getReleaseAssetContent(repoInfo: RepositoryInfo, asset: ReleaseAsset): Promise<string>;
export async function getGitCommitMessage(repoInfo: RepositoryInfo): Promise<string>;
```

#### 4.2.5 latest.ts

```typescript
export async function updateAndUploadLatestJson(
  release: Release,
  targetVersion: string,
  localUploadDir: string | undefined,
  repoInfo: RepositoryInfo,
  cdnBase: string,
  ftpConfig: FtpConfig | undefined,
  timezone: string
): Promise<void>;
```

#### 4.2.6 platform.ts

```typescript
export function getPlatformKey(fileName: string): string | undefined;
```

#### 4.2.7 utils.ts

```typescript
export function formatDateTimeWithTimezone(date: Date | number, timezone: string): string;
export function ensureTrailingSlash(str: string): string;
export function removeTrailingSlash(str: string): string;
export function safeJsonParse<T>(str: string, fallback: T): T;
export function safeJsonStringify(obj: unknown, fallback: string): string;
export async function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T;
export function throttle<T extends (...args: unknown[]) => unknown>(fn: T, limit: number): T;
```

---

## 5. 开发工作流

### 5.1 环境设置

```bash
# 安装依赖
pnpm install

# 安装开发依赖
pnpm install -D
```

### 5.2 开发模式

```bash
# 监听文件变化并编译
pnpm dev

# 编译 TypeScript
pnpm build

# 打包为单一文件
pnpm package

# 完整构建
pnpm build:full
```

### 5.3 代码规范

#### 5.3.1 TypeScript 配置

- 目标版本：ES2020
- 严格模式：启用
- 声明文件：生成
- 源映射：启用

#### 5.3.2 代码风格

- 使用 `camelCase` 命名变量和函数
- 使用 `PascalCase` 命名类和接口
- 使用 `UPPER_CASE` 命名常量
- 文件编码：UTF-8
- 行尾：LF

#### 5.3.3 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```bash
# 提交格式
<type>(<scope>): <description>

# 示例
feat(latest): 添加时区支持
fix(ftp): 修复路径结尾斜杠问题
docs(readme): 更新使用文档
refactor(utils): 提取通用函数
```

**常见类型**：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

---

## 6. 测试流程

### 6.1 单元测试

目前项目未配置单元测试框架，建议添加：

```bash
# 安装测试依赖
pnpm install -D jest @types/jest ts-jest

# 创建测试配置
# jest.config.ts
```

### 6.2 集成测试

**测试场景**：

| 场景 | 测试步骤 | 预期结果 |
|------|----------|----------|
| 版本提取 | 提供有效配置文件 | 正确提取版本号 |
| 版本提取 | 提供无效配置文件 | 返回默认版本或报错 |
| 文件复制 | 源目录存在文件 | 文件成功复制到目标目录 |
| 文件复制 | 源目录为空 | 无错误，创建空目录 |
| FTP 上传 | 有效凭据 | 上传成功 |
| FTP 上传 | 无效凭据 | 返回错误信息 |
| latest.json 生成 | 正常情况 | 生成正确格式的 JSON |

### 6.3 手动测试

1. **本地运行测试**：

```bash
# 设置环境变量
export INPUT_SOURCE-DIR="test/source/"
export INPUT_TARGET-ROOT="test/target/"
export INPUT_CONFIG-FILE="test/tauri.conf.json"

# 运行代码
pnpm build
node dist/main.js
```

2. **GitHub Actions 测试**：

创建 `.github/workflows/test.yml` 进行 CI 测试。

---

## 7. 部署流程

### 7.1 发布到 GitHub Actions Marketplace

```bash
# 1. 更新版本
pnpm mbump patch

# 2. 构建项目
pnpm build
pnpm package

# 3. 提交更改
git add .
git commit -m "chore: release vx.y.z"
git tag vx.y.z
git push origin main --tags
```

### 7.2 版本管理

使用 `mbump` 进行版本管理：

```bash
# 补丁版本 (1.0.3 → 1.0.4)
pnpm mbump patch

# 次版本 (1.0.3 → 1.1.0)
pnpm mbump minor

# 主版本 (1.0.3 → 2.0.0)
pnpm mbump major
```

### 7.3 发布流程

1. 创建 Release 在 GitHub
2. 触发 `release` 事件
3. Action 自动构建并部署

---

## 8. 优化建议

### 8.1 性能优化

| 优化项 | 当前状态 | 建议 | 预期收益 |
|--------|----------|------|----------|
| 文件过滤 | 简单过滤 | 添加更智能的版本匹配 | 减少不必要文件上传 |
| FTP 连接 | 每次创建新连接 | 添加连接池或复用 | 减少连接开销 |
| 错误重试 | 无重试机制 | 添加指数退避重试 | 提高稳定性 |

### 8.2 代码质量

| 优化项 | 当前状态 | 建议 | 预期收益 |
|--------|----------|------|----------|
| 单元测试 | 无 | 添加 Jest 测试 | 提高代码覆盖率 |
| 类型安全 | 基本类型定义 | 完善类型定义 | 减少运行时错误 |
| 错误处理 | 基础处理 | 添加统一错误处理 | 提高可维护性 |

### 8.3 功能增强

| 功能 | 描述 | 优先级 |
|------|------|--------|
| SFTP 支持 | 支持 SFTP 协议 | 高 |
| 并行上传 | 支持多文件并行上传 | 中 |
| 增量更新 | 只上传变更文件 | 中 |
| 通知功能 | 上传完成后发送通知 | 低 |

### 8.4 安全改进

| 安全项 | 当前状态 | 建议 |
|--------|----------|------|
| 敏感信息 | 使用 Secrets | 已实现 |
| 日志脱敏 | 可能泄露敏感信息 | 添加日志脱敏 |
| 输入验证 | 基本验证 | 增强输入验证 |

---

## 9. 安全注意事项

### 9.1 敏感信息保护

- 使用 GitHub Secrets 存储敏感信息
- 不在日志中打印密码等敏感信息
- 环境变量通过安全渠道传递

### 9.2 输入验证

- 验证输入参数格式
- 限制输入长度
- 防止路径遍历攻击

### 9.3 依赖安全

- 定期更新依赖
- 监控依赖安全漏洞
- 使用 `pnpm audit` 检查漏洞

### 9.4 最佳实践

```typescript
// 安全的日志输出
console.log(`Uploading to ${ftpConfig.host}`);
// 不要打印：console.log(`Password: ${ftpConfig.password}`);

// 输入验证
if (!isValidUrl(cdnBaseUrl)) {
  throw new Error('Invalid CDN base URL');
}

// 路径规范化
const safePath = path.normalize(inputPath).replace(/\.\./g, '');
```

---

## 📞 支持

如有问题，请创建 [Issue](https://github.com/supbose/tauri-actions/issues)。

---

**文档版本**: v0.1.0  
**最后更新**: 2026-05-13
