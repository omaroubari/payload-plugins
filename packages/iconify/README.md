# Iconify Icon Input for Payload CMS

A Payload CMS field that lets editors search and select Iconify icons.

## Install

```sh
pnpm add payload-iconify
```

## Usage

```ts
import { IconPickerField } from 'payload-iconify'

export const MyCollection = {
  slug: 'pages',
  fields: [
    IconPickerField({
      name: 'icon',
      label: 'Icon',
      icons: ['lucide', 'mdi'],
    }),
  ],
}
```

You can also pass a custom icon map:

```ts
IconPickerField({
  name: 'icon',
  customIcons: {
    'custom:logo': '<svg>...</svg>',
  },
})
```

## Client Component

The field uses the exported client component at:

```ts
payload-iconify/client#IconPickerFieldComponent
```

## License

MIT
