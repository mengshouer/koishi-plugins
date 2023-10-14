import { Context, h, Schema } from 'koishi'

export const name = 'cat'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.command('cat').action(async () => {
    const url = 'https://api.thecatapi.com/v1/images/search'
    const res = await ctx.http.get(url)
    return h.image(res?.[0].url)
  })
}
