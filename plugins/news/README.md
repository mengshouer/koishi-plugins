# koishi-plugin-news

[![npm](https://img.shields.io/npm/v/@mengshouer/koishi-plugin-news?style=flat-square)](https://www.npmjs.com/package/@mengshouer/koishi-plugin-news)

60s 看世界新闻定时推送插件。

## 安装

```bash
npm install @mengshouer/koishi-plugin-news
```

## 使用

- 命令 `60s` 手动获取新闻
- 自动定时推送（默认每天 7:50）

## 配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| cronTime | `50 7 * * *` | cron 定时表达式 |
| newsUrl | https://60s.viki.moe/v2/60s?encoding=image-proxy | 新闻接口 URL |
| broad | true | 全局广播 |

### 定时设置示例

- `50 7 * * *` - 每天 7:50 (默认)
- `0 8 * * *` - 每天 8:00
- `30 7 * * 1` - 每周一 7:30

格式：`分 时 日 月 周`，详见 [cron.org](http://crontab.org/)

## License

MIT