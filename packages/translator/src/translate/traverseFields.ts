import type { Field, PayloadRequest  } from 'payload'

import { groupHasName, tabHasName } from 'payload/shared'

import type { ValueToTranslate } from './types.js'

import { isEmpty } from '../utils/isEmpty.js'
import { objectId } from '../utils/objectId.js'
import { traverseRichText } from './traverseRichText.js'

export const traverseFields = ({
  dataFrom,
  emptyOnly,
  fields,
  localizedParent,
  req,
  siblingDataFrom,
  siblingDataTranslated,
  translatedData,
  valuesToTranslate,
}: {
  dataFrom: Record<string, unknown>
  emptyOnly?: boolean
  fields: Field[]
  localizedParent?: boolean
  req?: PayloadRequest
  siblingDataFrom?: Record<string, unknown>
  siblingDataTranslated?: Record<string, unknown>
  translatedData: Record<string, unknown>
  valuesToTranslate: ValueToTranslate[]
}) => {
  siblingDataFrom = siblingDataFrom ?? dataFrom
  siblingDataTranslated = siblingDataTranslated ?? translatedData

  for (const field of fields) {
    switch (field.type) {
      case 'array': {
        const arrayDataFrom = siblingDataFrom[field.name] as {
          id: string
        }[]

        if (isEmpty(arrayDataFrom)) {break}

        let arrayDataTranslated =
          (siblingDataTranslated[field.name] as { id: string }[] | undefined) ?? []

        if (field.localized || localizedParent) {
          if (arrayDataTranslated.length > 0 && emptyOnly) {break}

          arrayDataTranslated = arrayDataFrom.map(() => ({
            id: objectId(),
          }))
        }

        arrayDataTranslated.forEach((item, index) => {
          traverseFields({
            dataFrom,
            emptyOnly,
            fields: field.fields,
            localizedParent: localizedParent ?? field.localized,
            req,
            siblingDataFrom: arrayDataFrom[index],
            siblingDataTranslated: item,
            translatedData,
            valuesToTranslate,
          })
        })

        siblingDataTranslated[field.name] = arrayDataTranslated

        break
      }

      case 'blocks': {
        const blocksDataFrom = siblingDataFrom[field.name] as {
          blockType: string
          id: string
        }[]

        if (isEmpty(blocksDataFrom)) {break}

        let blocksDataTranslated =
          (siblingDataTranslated[field.name] as { blockType: string; id: string }[] | undefined) ??
          []

        if (field.localized || localizedParent) {
          if (blocksDataTranslated.length > 0 && emptyOnly) {break}

          blocksDataTranslated = blocksDataFrom.map(({ blockType }) => ({
            id: objectId(),
            blockType,
          }))
        }

        blocksDataTranslated.forEach((item, index) => {
          let block = field.blocks.find((each) => each.slug === item.blockType)

          if (!block && req?.payload?.config?.blocks) {
            block = req.payload.config.blocks.find((each) => each.slug === item.blockType)
          }

          if (!block) {return}

          traverseFields({
            dataFrom,
            emptyOnly,
            fields: block.fields,
            localizedParent: localizedParent ?? field.localized,
            req,
            siblingDataFrom: blocksDataFrom[index],
            siblingDataTranslated: item,
            translatedData,
            valuesToTranslate,
          })
        })

        siblingDataTranslated[field.name] = blocksDataTranslated

        break
      }

      case 'checkbox':
      case 'code':
      case 'date':
      case 'email':
      case 'json':
      case 'number':
      case 'point':
      case 'radio':
      case 'relationship':
      case 'select':
      case 'upload':
        siblingDataTranslated[field.name] = siblingDataFrom[field.name]

        break
      case 'collapsible':
      case 'row':
        traverseFields({
          dataFrom,
          emptyOnly,
          fields: field.fields,
          localizedParent,
          req,
          siblingDataFrom,
          siblingDataTranslated,
          translatedData,
          valuesToTranslate,
        })
        break
      case 'group': {
        const hasName = groupHasName(field as any)

        const groupDataFrom = hasName
          ? (siblingDataFrom[(field as any).name] as Record<string, unknown>)
          : siblingDataFrom

        if (!groupDataFrom) {break}

        const groupDataTranslated = hasName
          ? ((siblingDataTranslated[(field as any).name] as Record<string, unknown>) ?? {})
          : siblingDataTranslated

        traverseFields({
          dataFrom,
          emptyOnly,
          fields: field.fields,
          localizedParent: field.localized,
          req,
          siblingDataFrom: groupDataFrom,
          siblingDataTranslated: groupDataTranslated,
          translatedData,
          valuesToTranslate,
        })

        break
      }
      case 'richText': {
        if (!(field.localized || localizedParent) || isEmpty(siblingDataFrom[field.name])) {break}
        if (emptyOnly && siblingDataTranslated[field.name]) {break}

        const richTextDataFrom = siblingDataFrom[field.name] as object

        siblingDataTranslated[field.name] = richTextDataFrom

        if (!richTextDataFrom) {break}

        const isSlate = Array.isArray(richTextDataFrom)

        const isLexical = 'root' in richTextDataFrom

        if (!isSlate && !isLexical) {break}

        if (isLexical) {
          const root = (siblingDataTranslated[field.name] as Record<string, unknown>)
            ?.root as Record<string, unknown>

          if (root)
            {traverseRichText({
              onText: (siblingData) => {
                valuesToTranslate.push({
                  onTranslate: (translated: string) => {
                    siblingData.text = translated
                  },
                  value: siblingData.text,
                })
              },
              root,
            })}
        } else {
          for (const root of siblingDataTranslated[field.name] as unknown[]) {
            traverseRichText({
              onText: (siblingData) => {
                valuesToTranslate.push({
                  onTranslate: (translated: string) => {
                    siblingData.text = translated
                  },
                  value: siblingData.text,
                })
              },
              root: root as Record<string, unknown>,
            })
          }
        }

        break
      }

      case 'tabs':
        for (const tab of field.tabs) {
          const hasName = tabHasName(tab)

          const tabDataFrom = hasName
            ? (siblingDataFrom[tab.name] as Record<string, unknown>)
            : siblingDataFrom

          if (!tabDataFrom) {return}

          const tabDataTranslated = hasName
            ? ((siblingDataTranslated[tab.name] as Record<string, unknown>) ?? {})
            : siblingDataTranslated

          traverseFields({
            dataFrom,
            emptyOnly,
            fields: tab.fields,
            localizedParent: tab.localized,
            req,
            siblingDataFrom: tabDataFrom,
            siblingDataTranslated: tabDataTranslated,
            translatedData,
            valuesToTranslate,
          })
        }

        break
      case 'text':
      case 'textarea':
        if (field.custom && typeof field.custom === 'object' && field.custom.translatorSkip) {break}

        if (!(field.localized || localizedParent) || isEmpty(siblingDataFrom[field.name])) {break}
        if (emptyOnly && siblingDataTranslated[field.name]) {break}

        // do not translate the block ID or admin-facing label
        if (field.name === 'blockName' || field.name === 'id') {
          break
        }

        valuesToTranslate.push({
          onTranslate: (translated: string) => {
            siblingDataTranslated[field.name] = translated
          },
          value: siblingDataFrom[field.name],
        })
        break

      default:
        break
    }
  }
}
