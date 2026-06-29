import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

import type { Prompt, TranslateResolver } from './types.js'

import { chunkArray } from '../utils/chunkArray.js'

export type AISDKResolverConfig = {
  apiKey?: string
  /**
   * How many texts to include into 1 request
   * @default 100
   */
  chunkLength?: number
  /**
   * @default "gemini-2.0-flash-exp"
   */
  model?: string
  prompt?: Prompt
  provider?: string
}

const translationSchema = z.object({
  translations: z.array(z.string()),
})

const defaultPrompt: Prompt = ({ localeFrom, localeTo, texts }) => {
  return `Provide natural, idiomatic translations for the following texts from ${localeFrom} to ${localeTo}. Adapt phrasing to sound natural in the target language, avoiding literal word-for-word translations where they would be awkward. Note that 'بلّورة' is spelled as 'Ballurh' in English and 'بلّورة' in Arabic. Texts to translate: ${JSON.stringify(texts)}

Output in JSON format: {"translations": ["translated text 1", "translated text 2", ...]}`
}

export const aiSDKResolver = ({
  apiKey,
  chunkLength = 100,
  model = 'gemini-2.0-flash-exp',
  prompt = defaultPrompt,
  provider = 'google',
}: AISDKResolverConfig): TranslateResolver => {
  return {
    key: 'aiSDK',
    resolve: async ({ localeFrom, localeTo, req, texts }) => {
      try {
        if (!provider) {
          req.payload.logger.error('Provider is required for AI SDK resolver')
          return {
            success: false as const,
          }
        }

        // Determine API key: prefer provided key, fallback to Site settings
        let effectiveApiKey = apiKey
        if (!effectiveApiKey) {
          try {
            const settings: any = await req.payload.findGlobal({ slug: 'settings' })
            const siteKey = settings?.aiTranslatorConfig?.apiKey
            if (siteKey) {effectiveApiKey = siteKey}
          } catch (e) {
            req.payload.logger.info({
              error: e instanceof Error ? e.message : String(e),
              message:
                'AI SDK resolver: failed to read API key from settings for fallback',
            })
          }
        }

        if (!effectiveApiKey) {
          req.payload.logger.error(
            'AI SDK resolver: missing API key. Set GEMINI_API_KEY or settings.aiTranslatorConfig.apiKey',
          )
          return {
            success: false as const,
          }
        }

        let providerInstance: any

        if (provider === 'google') {
          providerInstance = createGoogleGenerativeAI({
            apiKey: effectiveApiKey,
          })
        } else {
          req.payload.logger.error(`Provider ${provider} is not supported`)
          return {
            success: false as const,
          }
        }

        const response: {
          data: { translations: string[] }
          success: boolean
        }[] = await Promise.all(
          chunkArray(texts, chunkLength).map((textChunk: string[]) => {
            return generateObject({
              model: providerInstance(model),
              prompt: prompt({ localeFrom, localeTo, texts: textChunk }),
              schema: translationSchema,
            })
              .then((result) => {
                return {
                  data: { translations: result.object.translations },
                  success: true,
                }
              })
              .catch((error) => {
                req.payload.logger.info({
                  error: error.message,
                  message: 'An error occurred when trying to translate the data using AI SDK',
                })
                return {
                  data: { translations: [] },
                  success: false,
                }
              })
          }),
        )

        const translated: string[] = []

        for (const { data, success } of response) {
          if (!success) {
            return {
              success: false as const,
            }
          }

          const translatedChunk = data?.translations

          if (!translatedChunk) {
            req.payload.logger.error(
              'An error occurred when trying to translate the data using AI SDK - missing translations in the response',
            )
            return {
              success: false as const,
            }
          }

          if (!Array.isArray(translatedChunk)) {
            req.payload.logger.error({
              data: translatedChunk,
              message:
                'An error occurred when trying to translate the data using AI SDK - translations is not an array',
            })
            return {
              success: false as const,
            }
          }

          for (const text of translatedChunk) {
            if (text && typeof text !== 'string') {
              req.payload.logger.error({
                chunkData: translatedChunk,
                data: text,
                message:
                  'An error occurred when trying to translate the data using AI SDK - translation is not a string',
              })
              return {
                success: false as const,
              }
            }

            translated.push(text)
          }
        }

        return {
          success: true as const,
          translatedTexts: translated,
        }
      } catch (e) {
        if (e instanceof Error) {
          req.payload.logger.info({
            message: 'An error occurred when trying to translate the data using AI SDK',
            originalErr: e.message,
          })
        }

        return { success: false as const }
      }
    },
  }
}
