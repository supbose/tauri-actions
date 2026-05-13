
## v0.0.19

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.18...v0.0.19)

### 🚀 特性

- 添加版本过滤复制文件的功能 (043a58f)
- **files utils:** Add copied files list output in copyFiles function (c09d607)
- **utils:** 新增joinUrl和formatUrl工具函数并重构URL拼接逻辑 (9be22fe)
- **platform工具:** 重构并完善平台文件识别逻辑 (91373b8)
- 添加按文件扩展名复制的功能 (3044078)
- **utils:** 新增Tauri目标平台自动检测功能 (4003af8)

### 🩹 修复

- **validation:** 修复Windows盘符路径校验逻辑，新增合法Windows路径测试用例 (bbe8506)
- 适配FTP服务器目录配置，修正资源访问路径 (9a66fc6)
- **utils/latest:** 修复serverDir路径末尾斜杠重复拼接问题 (375e18d)
- **utils/latest:** 优化latest.json生成更新逻辑 (ce0d1bd)
- 仅在windows平台下按版本过滤输入参数 (a80543e)
- **utils/latest:** 修复签名文件匹配逻辑并添加调试日志 (77103bb)
- **utils:** 优化签名文件匹配逻辑，支持不区分大小写和平台 fallback (9ad01cb)
- **utils/latest:** 修复getSignatureForAsset返回值错误 (8973edc)
- 修复时区格式化和24点时间显示问题 (593f10a)

### 💅 重构

- **validation:** 新增验证工具模块并重构日志脱敏逻辑 (08bf740)
- 优化FTP上传路径并修复清理开关 (c3b7f7d)
- **utils/latest:** 重构构建平台资源方法，适配CDN路径格式 (9796170)
- **utils/latest:** 简化latest.json生成逻辑，不再读取现有文件 (0f91f05)
- **utils:** 简化获取资产签名的逻辑 (a29bcab)
- **utils:** 重构签名获取逻辑，统一使用本地签名处理 (dba117e)
- **utils:** 重构时间格式化与OS检测相关逻辑 (33f387d)
- **utils:** 替换formatDateTimeWithTimezone为getISOWithTimeZone (b16007d)

### 📖 文档

- 新增优化分析、开发文档并更新README (90f7a0f)

### 📦 打包

- 移除build:full命令中的mbump步骤 (0399b20)

### 🏡 框架

- 修正ftp上传的危险清空目标目录参数 (32010ad)
- 移除下载路径中的download目录层级 (eabc617)

### ✅ 测试

- 新增完整的单元测试与 Jest 配置 (f14b109)

## v0.0.18

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.17...v0.0.18)

### 📦 打包

- 修正package.json中main入口文件路径 (5e275a0)

### 🏡 框架

- Rename package name from up-actions to tauri-actions (a9f95e4)

## v0.0.17

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.16...v0.0.17)

### 💅 重构

- 提取通用工具函数并重构现有代码 (fe0b333)

## v0.0.16

[compare changes](https://cnb.cool/supbose/tauri-actions/compare/v0.0.15...v0.0.16)

### 🚀 特性

- **upload:** Add FTP upload support for latest.json (f16d421)
- 添加时区配置以自定义latest.json的发布时间 (d8723e5)

### 🩹 修复

- **ftp:** 标准化ftp上传的目录路径格式 (3e65fa0)
- **ftp:** 修正FTP上传目录的拼接逻辑 (5d4c2b3)
- **github utils:** 完善release资源内容获取的类型处理 (c2e97cb)
- **utils:** 修复latest.json更新逻辑并增加错误处理 (8a93b2b)

### 💅 重构

- 重构项目工具模块结构 (b7ed305)
- 调整FTP上传顺序并新增latest.json复制逻辑 (f0ecd4a)
- **utils/latest:** 简化latest.json生成逻辑，不再读取现有资源 (cfe1bc2)
- **utils/latest:** 重构时区格式化日期逻辑 (e867a3c)

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

