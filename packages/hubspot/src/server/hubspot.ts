import type { PayloadRequest } from 'payload'

export type HubSpotForm = {
  fields?: HubSpotField[]
  id: string
  name: string
  portalId: string
}

export type HubSpotField = {
  fieldType?: string // text, textarea, select, radio, checkbox, booleancheckbox, date, number, email
  label?: string
  name: string
  options?: { label?: string; value: string }[]
  required?: boolean
  type?: string // string, number, date, enum
}

const HUBSPOT_BASE = 'https://api.hubapi.com'

const getToken = (req: PayloadRequest): string | undefined => {
  const configured = (req.payload.config.custom?.hubspotForms as { accessToken?: string } | undefined)
    ?.accessToken
  return configured || process.env.HUBSPOT_ACCESS_TOKEN
}

export async function fetchHubSpotForms(req: PayloadRequest): Promise<HubSpotForm[]> {
  const token = getToken(req)
  if (!token) {throw new Error('Hubspot access token is not set')}

  // Using legacy Forms API v2 for broader availability
  const res = await fetch(`${HUBSPOT_BASE}/forms/v2/forms`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {throw new Error('Failed to fetch HubSpot forms')}
  const data = (await res.json()) as any[]
  return data.map((f) => ({ id: f.guid, name: f.name, portalId: String(f.portalId) }))
}

export async function fetchHubSpotFormById(req: PayloadRequest, id: string): Promise<HubSpotForm> {
  const token = getToken(req)
  if (!token) {throw new Error('Hubspot access token is not set')}

  const res = await fetch(`${HUBSPOT_BASE}/forms/v2/forms/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {throw new Error('Failed to fetch HubSpot form by id')}
  const data: any = await res.json()

  return {
    id: data.guid,
    name: data.name,
    fields: (data.formFieldGroups[0].fields || []).map((f: any) => ({
      name: f.name,
      type: f.type,
      fieldType: f.fieldType,
      label: f.label,
      options: Array.isArray(f.options)
        ? f.options.map((o: any) => ({ label: o.label, value: String(o.value) }))
        : undefined,
      required: !!f.required,
    })),
    portalId: String(data.portalId),
  }
}
