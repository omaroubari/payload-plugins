# payload-hubspot

A [Payload CMS](https://payloadcms.com) plugin that syncs [HubSpot](https://www.hubspot.com) forms into the [Form Builder](https://payloadcms.com/docs/plugins/form-builder) collection.

It adds a **HubSpot Forms** button next to the Save/Publish buttons on your forms collection. Editors can fetch the forms defined in a HubSpot account, pick one, and have its fields imported into the Payload Form Builder document. The HubSpot `portalId` and `formId` are stored on the document so it stays linked to its source form.

## Features

- Adds a sync button to the edit view of the configured forms collection
- Modal to browse and search HubSpot forms
- Maps HubSpot field types to Form Builder block types (text, textarea, email, select, radio, checkbox, date, number, country, state)
- Stores HubSpot `portalId` / `formId` as read-only sidebar fields
- English and Arabic translations included

## Requirements

This plugin operates on a forms collection produced by `@payloadcms/plugin-form-builder`. Install and configure the Form Builder plugin alongside it.

## Installation

```sh
pnpm add payload-hubspot @payloadcms/plugin-form-builder
```

## Usage

```ts
import { buildConfig } from 'payload'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { hubspotForms } from 'payload-hubspot'

export default buildConfig({
  plugins: [
    formBuilderPlugin({
      // your form-builder options
    }),
    hubspotForms({
      // forms collection slug — defaults to 'forms'
      collection: 'forms',
    }),
  ],
})
```

## Configuration

| Option        | Type          | Default   | Description                                                                              |
| ------------- | ------------- | --------- | ---------------------------------------------------------------------------------------- |
| `collection`  | `CollectionSlug` | `'forms'` | Slug of the Form Builder collection to augment.                                       |
| `accessToken` | `string`      | —         | HubSpot Private App access token. Falls back to `HUBSPOT_ACCESS_TOKEN` env var.           |
| `disabled`    | `boolean`     | `false`   | Disable the runtime behavior while keeping schema additions (useful for migrations).     |

## Authentication

Provide a HubSpot Private App access token (Bearer token) via either:

- The `accessToken` plugin option, or
- The `HUBSPOT_ACCESS_TOKEN` environment variable.

The token needs access to the HubSpot Forms API.

## Development

This repo ships with a `dev/` Payload app for local testing. It uses PostgreSQL —
copy `dev/.env.example` to `dev/.env` and point `DATABASE_URI` at a running Postgres
instance before running the dev app or tests.

```sh
pnpm install
cp dev/.env.example dev/.env   # then set DATABASE_URI / PAYLOAD_SECRET
pnpm dev               # run the dev admin
pnpm test:int          # integration tests (vitest) — requires Postgres
pnpm test:e2e          # end-to-end tests (playwright) — requires Postgres
pnpm build             # build to dist/
```

## License

MIT
