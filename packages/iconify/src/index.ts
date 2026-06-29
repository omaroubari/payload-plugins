import type { Field, TextField } from 'payload'
import type { ComponentType } from 'react'

/**
 * Example usage:
 * - Static map: iconPickerField({ name: 'icon', icons: lucideIconsJson })
 * - Iconify set: iconPickerField({ name: 'icon', icons: 'lucide' })
 */
export const IconPickerField = (
  options?: {
    customIcons?: Record<string, ComponentType | string>
    icons?: string | string[]
  } & Partial<TextField>,
): Field => {
  const { customIcons, icons, ...rest } = options || {}

  return {
    ...rest,
    name: rest?.name || 'iconPicker',
    type: 'text',
    admin: {
      ...rest?.admin,
      components: {
        ...rest?.admin?.components,
        Field: {
          clientProps: {
            customIcons,
            icons,
          },
          path: 'payload-iconify/client#IconPickerFieldComponent',
        },
      },
    },
    label: rest?.label || 'Icon Picker',
  } as TextField
}
