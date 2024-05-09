import { Context, Logger, Schema } from 'koishi'

export const name = 'random_repeater'

export interface Config {
  prob_a: number
}
export const usage = `不复读率 随 复读次数 指数级衰减\n
从第2条复读，即第3条重复消息开始有几率触发复读\n
a 设为一个略大于1的小数，最好不要超过2，建议1.6\n
复读概率计算式：p_n = 1 - 1/a^n\n
递推式：p_n+1 = 1 - (1 - p_n) / a
`

export const Config: Schema<Config> = Schema.object({
  prob_a: Schema.number().default(1.6).description('a 设为一个略大于1的小数，最好不要超过2，建议1.6，越高复读概率越大'),
})

export function apply(ctx: Context, config: Config) {
  // groupId: (lastMsg, isRepeated, p)
  const groupStat: Record<string, [string, boolean, number]> = {}
  const logger = ctx?.logger || new Logger(name)

  ctx.on('message', async (session) => {
    const groupId = session.channelId
    const msg = session.content

    if (!groupStat[groupId]) {
      groupStat[groupId] = [msg, false, 0]
      return
    }

    const [lastMsg, isRepeated, p] = groupStat[groupId]
    if (lastMsg === msg) {
      // 群友正在复读
      if (!isRepeated) {
        // 机器人尚未复读过，开始测试复读
        if (Math.random() < p) {
          // 概率测试通过，复读并设flag
          try {
            groupStat[groupId] = [msg, true, 0]
            await session.send(msg)
          } catch (e) {
            logger.error('复读失败:', e)
          }
        } else {
          // 概率测试失败，蓄力
          groupStat[groupId] = [msg, false, 1 - (1 - p) / config.prob_a]
        }
      }
    } else {
      // 不是复读，重置
      groupStat[groupId] = [msg, false, 0]
    }
  })
}
