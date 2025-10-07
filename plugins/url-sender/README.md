# koishi-plugin-url-sender

[![npm](https://img.shields.io/npm/v/@mengshouer/koishi-plugin-url-sender?style=flat-square)](https://www.npmjs.com/package/@mengshouer/koishi-plugin-url-sender)

通过 URL 自动检测并发送图片或视频的 Koishi 插件

## 安装

```bash
npm install @mengshouer/koishi-plugin-url-sender
```

或

```bash
yarn add @mengshouer/koishi-plugin-url-sender
```

## 使用方法

### 基本用法

```
botcmd-send https://example.com/image.jpg
botcmd-send https://example.com/video.mp4
```

### 支持的格式

#### 默认支持的图片格式

- **MIME 类型**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/bmp`, `image/svg+xml`
- **文件扩展名**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`, `.svg`

#### 默认支持的视频格式

- **MIME 类型**: `video/mp4`, `video/avi`, `video/mkv`, `video/webm`, `video/mov`, `video/wmv`, `video/flv`, `video/3gp`
- **文件扩展名**: `.mp4`, `.avi`, `.mkv`, `.webm`, `.mov`, `.wmv`, `.flv`, `.3gp`

### 配置说明

- **maxFileSize**: 设置允许的最大文件大小，超过此大小的文件将被拒绝
- **timeout**: HTTP 请求的超时时间，避免长时间等待无响应的 URL
- **allowedHosts**: 主机白名单，可以限制只允许特定域名的 URL，提高安全性
- **supportedImageTypes/supportedVideoTypes**: 自定义支持的 MIME 类型
- **supportedImageExtensions/supportedVideoExtensions**: 自定义支持的文件扩展名
