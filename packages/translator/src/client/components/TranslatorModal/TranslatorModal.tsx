import './styles.scss'

import { Modal, XIcon } from '@payloadcms/ui'

import { useTranslator } from '../../providers/Translator/context.js'
import { Content } from './Content.js'

export const TranslatorModal = () => {
  const { closeTranslator, modalSlug, resolver } = useTranslator()

  if (!resolver) {return}

  return (
    <Modal className={'translator__modal'} slug={modalSlug}>
      <div className={'translator__wrapper'}>
        <button aria-label="Close" className={'translator__close'} onClick={closeTranslator}>
          <XIcon />
        </button>
        <Content />
      </div>
    </Modal>
  )
}
