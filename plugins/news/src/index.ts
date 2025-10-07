import { Context, h, Schema } from "koishi";

export const name = "news";
export const inject = {
  optional: ["cron"],
};

export const usage = `
# 60s 新闻定时推送

自动推送每日 60s 看世界新闻图片。

## 使用

- 命令 \`60s\` 手动获取新闻
- 配置 cron 自动推送

## 定时配置

使用 cron 表达式设置推送时间：

- \`50 7 * * *\` - 每天 7:50 (默认)

格式：\`分 时 日 月 周\`，详见 <a href="http://crontab.org/">cron.org</a>
`;

export interface Config {
  cronTime?: string;
  newsUrl?: string;
  broad?: boolean;
  broadArray?: { adapter: string; botId: string; groupId: string }[];
  debugModel?: boolean;
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    cronTime: Schema.string()
      .default("50 7 * * *")
      .description("cron 定时表达式 (分 时 日 月 周)"),
    newsUrl: Schema.string()
      .default("https://60s.viki.moe/v2/60s?encoding=image-proxy")
      .description("60s 新闻图片接口 URL"),
  }).description("基础设置"),
  Schema.object({
    broad: Schema.boolean()
      .default(true)
      .description("在所有群聊广播,关闭后可指定群配置"),
  }).description("全局广播"),
  Schema.union([
    Schema.object({
      broad: Schema.const(false).required(),
      broadArray: Schema.array(
        Schema.object({
          adapter: Schema.string().default("onebot").description("适配器名"),
          botId: Schema.string().default("552487878").description("机器人账号"),
          groupId: Schema.string().default("1145141919").description("群组号"),
        })
      ).role("table"),
    }),
    Schema.object({}),
  ]),
  Schema.object({
    debugModel: Schema.boolean()
      .default(false)
      .description("开启后会输出详细日志"),
  }).description("调试模式"),
]);

declare module "koishi" {
  interface Events {
    "news/push-event"(message: string): void;
  }

  interface Context {
    cron(pattern: string, callback: () => void | Promise<void>): void;
  }
}

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger("news");

  if (config.debugModel) {
    logger.level = 3; // DEBUG level
  }

  const morntime = config.cronTime;

  ctx
    .command("botcmd-news", "手动触发60s新闻发送到当前会话")
    .action(() => getNewsMsg());

  try {
    ctx.cron(morntime, async () => {
      ctx.emit("news/push-event", null);
    });
    logger.info(`News scheduled with pattern: ${morntime}`);
  } catch (error) {
    logger.error("Failed to setup cron job:", error);
  }

  ctx.on("news/push-event", async () => await sendNewsMsg());

  async function sendNewsMsg() {
    const outMsg = await getNewsMsg();
    if (config.broad) await ctx.broadcast(outMsg);
    else {
      for (const broad of config.broadArray) {
        ctx.bots[`${broad.adapter}:${broad.botId}`].sendMessage(
          `${broad.groupId}`,
          outMsg
        );
        await ctx.sleep(2000);
      }
    }
  }

  async function getNewsMsg() {
    try {
      const response = await ctx.http.get(config.newsUrl);
      logger.debug("60s news response:", response);
      return h.image(response, "image/png");
    } catch (error) {
      logger.error("获取60s新闻失败:", error);
      return "获取60s新闻失败，请稍后重试";
    }
  }
}
