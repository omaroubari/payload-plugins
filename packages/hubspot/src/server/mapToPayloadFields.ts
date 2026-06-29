import type { HubSpotField } from './hubspot.js'

type PayloadBlock = Record<string, any>

// Generate a 24-char hex id for new block rows so the admin UI has stable keys
// before the document is persisted.
const objectId = (): string => {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, '0')
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(
    '',
  )
  return `${timestamp}${random}`
}

const toOptions = (opts: { label?: string; value: string }[] | undefined) =>
  (opts || []).map((o) => ({ label: o.label ?? o.value, value: o.value }))

export function mapHubSpotFieldsToPayloadBlocks(fields: HubSpotField[]): PayloadBlock[] {
  const blocks: PayloadBlock[] = []

  for (const f of fields) {
    const name = f.name
    const label = f.label || name
    const required = !!f.required
    const fieldType = (f.fieldType || '').toLowerCase()
    const type = (f.type || '').toLowerCase()

    // Prefer specific matches first
    if (name === 'email' || fieldType === 'email') {
      blocks.push({ id: objectId(), name, blockType: 'email', label, required })
      continue
    }

    if (name === 'country') {
      blocks.push({ id: objectId(), name, blockType: 'country', label, required })
      continue
    }

    if (name === 'state') {
      blocks.push({ id: objectId(), name, blockType: 'state', label, required })
      continue
    }

    if (fieldType === 'textarea') {
      blocks.push({ id: objectId(), name, blockType: 'textarea', label, required })
      continue
    }

    if (fieldType === 'select' || fieldType === 'radio' || type === 'enum') {
      blocks.push({
        id: objectId(),
        name,
        blockType: fieldType === 'radio' ? 'radio' : 'select',
        label,
        options: toOptions(f.options),
        required,
      })
      continue
    }

    if (fieldType === 'booleancheckbox' || fieldType === 'checkbox') {
      blocks.push({ id: objectId(), name, blockType: 'checkbox', label, required })
      continue
    }

    if (fieldType === 'date' || type === 'date') {
      blocks.push({ id: objectId(), name, blockType: 'date', label, required })
      continue
    }

    if (fieldType === 'number' || type === 'number') {
      blocks.push({ id: objectId(), name, blockType: 'number', label, required })
      continue
    }

    // Default to text
    blocks.push({ id: objectId(), name, blockType: 'text', label, required })
  }

  return blocks
}
