'use client'

import './styles.scss'

import { Modal, TextInput, useTranslation, XIcon } from '@payloadcms/ui'

import { useHubspotForms } from '../../providers/HubspotForms/context.js'

export const HubspotFormsModal = () => {
  const {
    closeModal,
    forms,
    isOpen,
    loadForms,
    loading,
    modalSlug,
    query,
    selectAndApply,
    setQuery,
  } = useHubspotForms()
  const { t } = useTranslation()

  if (!isOpen) {return null}

  return (
    <Modal
      className={'hubspot-forms__modal'}
      onEnter={loadForms}
      slug={modalSlug}
      style={{ zIndex: 101 }}
    >
      <div className={'hubspot-forms__wrapper'}>
        <button aria-label="Close" className={'hubspot-forms__close'} onClick={closeModal}>
          <XIcon />
        </button>
        <header className={'hubspot-forms__header'}>
          <h2 className={'hubspot-forms__title'}>{t('plugin-hubspot-forms:modalTitle' as any)}</h2>
          <p className={'hubspot-forms__subtitle'}>
            Select a HubSpot form to import its fields into this Payload form. You need to save the
            document first before applying the form.
          </p>
        </header>

        <div className={'hubspot-forms__toolbar'}>
          <TextInput
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            path={`hubspot-forms__search`}
            placeholder={t('plugin-hubspot-forms:searchPlaceholder' as any)}
            value={query}
          />
        </div>

        <div className={'hubspot-forms__list'}>
          {loading && (
            <div className={'hubspot-forms__loading'}>
              <div className={'hubspot-forms__skeleton'} />
              <div className={'hubspot-forms__skeleton'} />
              <div className={'hubspot-forms__skeleton'} />
            </div>
          )}
          {!loading &&
            forms.map(({ id, name, portalId }) => (
              <button
                className={'hubspot-forms__list-item'}
                key={id}
                onClick={() => selectAndApply({ id })}
                type="button"
              >
                <div className={'hubspot-forms__list-item__body'}>
                  <div className={'hubspot-forms__list-name'}>{name}</div>
                  <div className={'hubspot-forms__list-meta'}>
                    <code>{portalId}</code>
                    <span> • </span>
                    <code>{id}</code>
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>
    </Modal>
  )
}
