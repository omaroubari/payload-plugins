import type { Config, Plugin } from 'payload'

import { deepMerge } from 'payload/shared'

import type { HubSpotFormsPluginConfig } from './types.js'

import { applyFormEndpoint } from './server/applyFormEndpoint.js'
import { listFormsEndpoint } from './server/listFormsEndpoint.js'

const customButtonPath = 'payload-hubspot/client#CustomButtonWithHubspot'

export const hubspotForms: (cfg?: HubSpotFormsPluginConfig) => Plugin = (cfg) => {
  const collectionSlug = (cfg?.collection ?? 'forms')

  return (config) => {
    const customHubspotForms = {
      collection: collectionSlug,
      ...(cfg?.accessToken ? { accessToken: cfg.accessToken } : {}),
    }

    const updated: Config = {
      ...config,
      admin: {
        ...(config.admin ?? {}),
        custom: {
          ...(config.admin?.custom ?? {}),
          hubspotForms: {
            collection: collectionSlug,
          },
        },
      },
      // Add hidden fields to the Forms collection to store HubSpot IDs
      collections:
        config.collections?.map((collection) => {
          if (collection.slug !== collectionSlug) {return collection}

          return {
            ...collection,
            admin: {
              ...(collection.admin ?? {}),
              components: {
                ...(collection.admin?.components ?? {}),
                edit: {
                  ...(collection.admin?.components?.edit ?? {}),

                  // inject buttons next to Save/Publish
                  PublishButton: {
                    clientProps: { type: 'publish' },
                    path: customButtonPath,
                  },
                  SaveButton: {
                    clientProps: { type: 'save' },
                    path: customButtonPath,
                  },
                },
              },
            },
            fields: [
              ...(collection.fields ?? []),
              {
                name: 'hubspotPortalId',
                type: 'text',
                admin: { position: 'sidebar', readOnly: true },
                label: 'HubSpot Portal ID',
                localized: false,
                required: false,
              },
              {
                name: 'hubspotFormId',
                type: 'text',
                admin: { position: 'sidebar', readOnly: true },
                label: 'HubSpot Form ID',
                localized: false,
                required: false,
              },
            ],
          }
        }) ?? [],
      custom: {
        ...(config.custom ?? {}),
        hubspotForms: customHubspotForms,
      },
      endpoints: [
        ...(config.endpoints ?? []),
        { handler: listFormsEndpoint, method: 'get', path: '/hubspot/forms' },
        { handler: applyFormEndpoint, method: 'post', path: '/hubspot/forms/apply' },
      ],

      i18n: {
        ...config.i18n,
        translations: {
          ...deepMerge(config.i18n?.translations ?? {}, {
            ar: {
              'plugin-hubspot-forms': {
                buttonLabel: 'مزامنة من هبوت',
                cancelButton: 'إلغاء',
                confirmButton: 'استخدم هذا الإشعار',
                errorMessage: 'لم يتم إنشاء إشعار من هبوت.',
                modalTitle: 'اختر إشعار من هبوت',
                searchPlaceholder: 'ابحث عن إشعارات من هبوت…',
                successMessage: 'تم إنشاء إشعار من هبوت. يرجى حفظه للتطبيق.',
              },
            },
            en: {
              'plugin-hubspot-forms': {
                buttonLabel: 'Sync from HubSpot',
                cancelButton: 'Cancel',
                confirmButton: 'Use this form',
                errorMessage: 'Could not fetch or apply HubSpot form.',
                modalTitle: 'Choose a HubSpot form',
                searchPlaceholder: 'Search forms…',
                successMessage: 'Form fields populated from HubSpot. Save to apply.',
              },
            },
          }),
        },
      },
    }

    // Keep schema additions even when disabled so migrations stay consistent;
    // only the endpoints are skipped.
    if (cfg?.disabled) {
      return {
        ...updated,
        endpoints: config.endpoints,
      }
    }

    return updated
  }
}

export * from './types.js'
