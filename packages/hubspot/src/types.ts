import type { CollectionSlug } from 'payload'

export type HubSpotFormsPluginConfig = {
  /**
   * HubSpot Private App access token (Bearer token).
   * Falls back to the `HUBSPOT_ACCESS_TOKEN` environment variable when omitted.
   */
  accessToken?: string
  /** Forms collection slug (defaults to 'forms') */
  collection?: CollectionSlug
  /** Disable the plugin while keeping the schema additions intact (useful for migrations). */
  disabled?: boolean
}
