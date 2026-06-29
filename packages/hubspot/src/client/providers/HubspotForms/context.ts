import { createContext, useContext } from 'react'

import type { HubSpotFormListItem } from '../../api/index.js'

type HubspotFormsContextData = {
  closeModal: () => void
  forms: HubSpotFormListItem[]
  isOpen: boolean
  loadForms: () => Promise<void>
  loading: boolean
  modalSlug: string
  openModal: () => void
  query: string
  selectAndApply: (args: { id: string }) => Promise<void>
  setQuery: (q: string) => void
}

export const HubspotFormsContext = createContext<HubspotFormsContextData | null>(null)

export const useHubspotForms = () => {
  const ctx = useContext(HubspotFormsContext)
  if (!ctx) {throw new Error('useHubspotForms must be used within HubspotFormsProvider')}
  return ctx
}
