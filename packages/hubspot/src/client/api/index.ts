// Client API (browser)

// - Purpose: Thin wrapper around fetch to the Payload server endpoints, used by the modal/provider.
// - listForms(): GET serverURL + api + '/hubspot/forms'
//     - Returns { success, forms?: [{ id, name, portalId }] }
//     - Used to display/search forms in the modal.
// - applyForm({ hubspotFormId, docId }): POST serverURL + api + '/hubspot/forms/apply'
//     - Returns { success }
//     - Triggers the server to fetch the HubSpot form, map fields, and update the current Payload
// form.
// - Extras:
//     - Sends credentials: 'include' so admin session/auth is applied.
//     - The provider then refreshes editor state (getFormState + REPLACE_STATE) and shows toasts.

export type HubSpotFormListItem = {
  id: string
  name: string
  portalId: string
}

export const createClient = ({ api, serverURL }: { api: string; serverURL: string }) => {
  const listForms = async (): Promise<{ forms?: HubSpotFormListItem[]; success: boolean }> => {
    try {
      const res = await fetch(`${serverURL}${api}/hubspot/forms`, {
        credentials: 'include',
      })
      if (!res.ok) {return { success: false }}
      return res.json()
    } catch {
      return { success: false }
    }
  }

  const applyForm = async (args: {
    docId?: string
    hubspotFormId: string
  }): Promise<{ doc?: any; success: boolean }> => {
    try {
      const res = await fetch(`${serverURL}${api}/hubspot/forms/apply`, {
        body: JSON.stringify(args),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!res.ok) {return { success: false }}
      return res.json()
    } catch {
      return { success: false }
    }
  }

  return { applyForm, listForms }
}
