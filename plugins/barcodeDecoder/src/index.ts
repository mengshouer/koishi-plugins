import { Context, Schema, segment } from 'koishi'
import {
  readBarcodesFromImageFile,
  type ReaderOptions,
} from 'zxing-wasm'

export const name = 'barcodeDecoder'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

const decodeHints: ReaderOptions = {
  tryHarder: true,
  formats: ['QRCode', 'Aztec', 'Codabar', 'Code128', 'Code39', 'Code93', 'DataBar',
    'DataBarExpanded', 'DataMatrix', 'EAN-13', 'EAN-8', 'ITF', 'Linear-Codes',
    'Matrix-Codes', 'MaxiCode', 'MicroQRCode', 'PDF417', 'UPC-A', 'UPC-E'],
  maxNumberOfSymbols: 1,
}

const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
  if (!contentType) {
    contentType = b64Data.split(';')[0].split(':')[1]
    b64Data = b64Data.split(',')[1]
  }
  const byteCharacters = atob(b64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  const blob = new Blob(byteArrays, { type: contentType })
  return blob
}

export function apply(ctx: Context) {
  ctx.command('barcodeDecoder [image:text]').action(async (_, image) => {
    const [code] = segment.select(image || [], 'img')
    const base64orUrl: string = code ? code.attrs.src : image
    try {
      const blob = base64orUrl.startsWith('data:image/')
        ? b64toBlob(base64orUrl)
        : await ctx.http.get(base64orUrl, {
          responseType: 'arraybuffer',
        }).then((data) => new Blob([data]))

      const imageFileReadResults = await readBarcodesFromImageFile(
        blob,
        decodeHints,
      )
      const result = imageFileReadResults.reduce((acc, cur) => {
        acc += cur.text + '\n'
        return acc
      }, '图片识别结果：')
      return result
    } catch (e) {
      return `图片识别失败：${e}`
    }
  })
}
