import { Context, h, Schema } from 'koishi'

export const name = 'dog'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.command('botcmd-dog').action(async () => {
    let imageUrl: string
    try {
      const res = await ctx.http.get(
        'https://api.thedogapi.com/v1/images/search',
        { timeout: 5000 },
      )
      imageUrl = res?.[0].url
    } catch (error) {
      const res = await ctx.http.get(
        'https://dog.ceo/api/breeds/image/random',
        { timeout: 5000 },
      )
      imageUrl = res?.message
    }

    return h.image(imageUrl)
  })
}
