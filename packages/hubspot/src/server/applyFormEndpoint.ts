import type { PayloadHandler } from 'payload'

import { APIError } from 'payload'

import { generateLexicalContent } from '../utilities/generateLexicalContent.js'
import { fetchHubSpotFormById } from './hubspot.js'
import { mapHubSpotFieldsToPayloadBlocks } from './mapToPayloadFields.js'

export const applyFormEndpoint: PayloadHandler = async (req) => {
  if (!req.json) {throw new APIError('Content-Type should be json', 400)}
  const body = await req.json()
  const { docId, hubspotFormId } = body as { docId?: string; hubspotFormId?: string }
  if (!hubspotFormId) {throw new APIError('Bad Request', 400)}

  const safeDocId = docId && docId !== 'undefined' ? docId : undefined

  try {
    const hsForm = await fetchHubSpotFormById(req, hubspotFormId)

    // Only applies to the configured forms collection
    const formsCollection = req.payload.config.custom.hubspotForms.collection ?? 'forms'
    if (!formsCollection) {throw new APIError('Forms collection not found', 500)}

    // Build new fields array
    const newBlocks = mapHubSpotFieldsToPayloadBlocks(hsForm.fields || [])

    // Update the form document in place
    if (safeDocId) {
      const data = await req.payload.update({
        id: safeDocId,
        collection: formsCollection,
        data: {
          fields: newBlocks,
          hubspotFormId: hsForm.id,
          hubspotPortalId: hsForm.portalId,
        },
        req,
      })
      return Response.json({ doc: data, success: true })
    } else {
      const data = await req.payload.create({
        collection: formsCollection,
        data: {
          confirmationMessage: generateLexicalContent([
            {
              type: 'p',
              text: 'Thank you for your submission!',
            },
          ]),
          fields: newBlocks,
          hubspotFormId: hsForm.id,
          hubspotPortalId: hsForm.portalId,
          title: hsForm.name,
        },
      })

      return Response.json({ doc: data, success: true })
    }
  } catch (e) {
    req.payload.logger.error({
      error: e instanceof Error ? e.message : String(e),
      message: 'HubSpot apply error',
    })
    return Response.json({ success: false })
  }
}
