import type { Payload } from 'payload'

import config from '@payload-config'
import { getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

let payload: Payload

afterAll(async () => {
  await payload.destroy()
})

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('hubspotForms plugin integration tests', () => {
  test('adds HubSpot id fields to the configured forms collection', () => {
    const forms = payload.collections['forms']
    expect(forms).toBeDefined()

    const fieldNames = forms.config.fields
      .map((field) => ('name' in field ? field.name : undefined))
      .filter(Boolean)

    expect(fieldNames).toContain('hubspotPortalId')
    expect(fieldNames).toContain('hubspotFormId')
  })

  test('registers the HubSpot endpoints', () => {
    const paths = (payload.config.endpoints ?? []).map(
      (e) => `${e.method.toUpperCase()} ${e.path}`,
    )
    expect(paths).toContain('GET /hubspot/forms')
    expect(paths).toContain('POST /hubspot/forms/apply')
  })

  test('exposes the forms collection slug on config.custom', () => {
    expect(payload.config.custom.hubspotForms.collection).toBe('forms')
  })
})
