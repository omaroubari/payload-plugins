'use client'

import { PublishButton, SaveButton, useConfig, useDocumentInfo } from '@payloadcms/ui'

import { HubspotFormsProvider } from '../../providers/HubspotForms/Provider.js'
import { HubspotFormsModal } from '../Modal/HubspotFormsModal.js'
import { HubspotSyncButton } from '../SyncButton/HubspotSyncButton.js'

export const CustomButtonWithHubspot = ({ type }: { type: 'publish' | 'save' }) => {
  const DefaultButton = type === 'publish' ? PublishButton : SaveButton

  const { collectionSlug } = useDocumentInfo()
  const { config } = useConfig()
  // only render on the configured forms collection
  const target = (config.admin?.custom as any)?.hubspotForms?.collection || 'forms'
  if (collectionSlug !== target) {return <DefaultButton />}

  return (
    <HubspotFormsProvider>
      <div className={'hubspot-forms__custom-save-button'}>
        <HubspotFormsModal />
        <HubspotSyncButton />
        <DefaultButton />
      </div>
    </HubspotFormsProvider>
  )
}
