import { Context, Schema } from 'koishi'

export const name = 'ping'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.command('ping').action(({ session: { event } }) => {
    const { timestamp } = event
    const now = Date.now()
    const diff = now - timestamp
    return `-> ${diff}ms`
  })
}
