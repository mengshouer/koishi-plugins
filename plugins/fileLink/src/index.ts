import { Context, h, Schema } from 'koishi'

export const name = 'filelink'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

const fnameRegex = /fname=.*/
const imageSuffix = ['.jpg', '.png', '.gif', '.bmp', 'jfif', 'webp']
const videoSuffix = ['.mp4', '.avi', '.mkv', '.rmvb', '.flv', '.wmv', '.mpg', '.mpeg']
const soundSuffix = ['.mp3', '.wav', '.flac', '.ape', '.aac', '.ogg', '.wma']

export function apply(ctx: Context) {
  ctx.platform('onebot').middleware((session, next) => {
    const { event } = session

    for (const el of event.message.elements) {
      if (el.type === 'file') {
        const { name, size, url } = el.attrs
        if (!url) return next()
        const link = url?.replace(
          fnameRegex,
          'fname=' + encodeURIComponent(name),
        )

        if (
          imageSuffix.includes(link.slice(-4).toLowerCase())
          && size < 31457280
        ) {
          return h.image(link)
        }

        if (
          videoSuffix.includes(link.slice(-4).toLowerCase())
          && size < 104857600
        ) {
          return h.video(link)
        }

        if (
          soundSuffix.includes(link.slice(-4).toLowerCase())
          && size < 31457280
        ) {
          return h.audio(link)
        }

        return `文件：${name}\n直链：${link}`
      }
    }

    return next()
  })
}
