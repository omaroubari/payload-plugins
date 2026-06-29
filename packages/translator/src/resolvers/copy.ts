import type { TranslateResolver } from './types.js'

export const copyResolver = (): TranslateResolver => {
  return {
    key: 'copy',
    resolve: (args) => {
      const { localeFrom, localeTo, req, texts } = args

      return {
        success: true,
        translatedTexts: texts,
      }
    },
  }
}
