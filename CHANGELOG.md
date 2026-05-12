
## v0.0.15

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.14...v0.0.15)

### 🚀 特性

- **copyFiles:** Add version filter parameter for file copying (6d3e8d0)

### 🩹 修复

- **main:** 移除重复的windows-x86_64平台标识推送 (8edf666)
- **main:** 移除重复的windows-aarch64构建key (6a4ce97)

### 📦 打包

- 切换到esbuild构建并清理旧的dist产物 (f014e95)
- 生成项目发布构建产物 (784e37e)

## v0.0.14

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.13...v0.0.14)

### 💅 重构

- **platform:** 重构平台键获取逻辑，支持多键匹配 (fa1a002)
- **platform:** Rewrite platform key parsing to support multiple keys per asset (e368e85)

### 📦 打包

- 调整项目构建配置与依赖 (8276944)

### 🏡 框架

- Update CHANGELOG.md (94b5b0f)
- Release v0.0.13 (052c713)
- Update CHANGELOG.md (522bae4)
- Release v0.0.13 (c07eec1)
- Update CHANGELOG.md (ec645d9)
- Release v0.0.13 (c71d6fa)

## v0.0.13

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.12...v0.0.13)

### 💅 重构

- **platform:** Rewrite platform key parsing to support multiple keys per asset (e368e85)

### 🏡 框架

- Update CHANGELOG.md (522bae4)
- Release v0.0.13 (c07eec1)

## v0.0.13

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.12...v0.0.13)

### 💅 重构

- **platform:** Rewrite platform key parsing to support multiple keys per asset (e368e85)

## v0.0.12

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.11...v0.0.12)

### 🚀 特性

- Add fetch latest commit message to populate release notes (0e7ca09)

## v0.0.11

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.10...v0.0.11)

### 🚀 特性

- 添加上传latest.json后的url打印日志 (785f1dd)

## v0.0.10

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.9...v0.0.10)

### 💅 重构

- 调整buildPlatformsFromAssets的资源加载逻辑 (2ab72ac)

## v0.0.9

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.8...v0.0.9)

### 🩹 修复

- 为fs.readdirSync调用添加utf8编码参数 (fe9705f)

## v0.0.8

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.7...v0.0.8)

### 💅 重构

- 重构代码，提取公共方法减少重复代码 (3151492)

## v0.0.7

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.6...v0.0.7)

### 💅 重构

- 重构平台匹配逻辑并添加本地文件支持 (5214524)

## v0.0.6

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.5...v0.0.6)

### 🚀 特性

- 新增签名加载逻辑，完善版本发布JSON生成 (dad9b71)

## v0.0.5

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.4...v0.0.5)

### 🩹 修复

- 跳过处理latest.json和.sig后缀的签名文件 (c943b7a)

## v0.0.4

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.3...v0.0.4)

### 🚀 特性

- 新增当找不到latest.json时自动生成更新配置的逻辑 (71b2c3f)

### 💅 重构

- **update-and-upload-latest-json:** 重构代码逻辑，统一输出内容处理流程 (fb1d919)

## v0.0.3

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.2...v0.0.3)

### 🚀 特性

- Add cdn base url support for download links (4552611)

## v0.0.2

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.1...v0.0.2)

### 🚀 特性

- **.cnb.yml:** 添加主分支推送配置 (6106578)

