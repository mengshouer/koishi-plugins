import { Context, h, Schema } from 'koishi'

export const name = 'fox'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.command('fox').action(async () => {
    const res = await ctx.http.get('https://randomfox.ca/floof/', {
      timeout: 5000,
    })
    return h.image(res?.image)
  })
}
