import type { PayloadHandler } from 'payload'

import { APIError } from 'payload'

import { fetchHubSpotForms } from './hubspot.js'

export const listFormsEndpoint: PayloadHandler = async (req) => {
  try {
    const forms = await fetchHubSpotForms(req)
    return Response.json({ forms, success: true })
  } catch (e) {
    req.payload.logger.error({
      error: e instanceof Error ? e.message : String(e),
      message: 'HubSpot list error',
    })
    throw new APIError('Failed to fetch HubSpot forms', 500)
  }
}
