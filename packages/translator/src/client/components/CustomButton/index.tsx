import type { CustomPublishButton, CustomSaveButton } from 'payload'

export const CustomButton = (type: 'publish' | 'save'): CustomPublishButton   => {
  return {
    clientProps: {
      type,
    },
    path: 'payload-translator/client#CustomButtonWithTranslator',
  }
}
