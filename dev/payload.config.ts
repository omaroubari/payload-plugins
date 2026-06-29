import { postgresAdapter } from '@payloadcms/db-postgres'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { hubspotForms } from 'payload-hubspot'
import { copyResolver, translator } from 'payload-translator'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { testEmailAdapter } from './helpers/testEmailAdapter.js'
import { seed } from './seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'posts',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
      ],
    },
    {
      slug: 'media',
      fields: [],
      upload: {
        staticDir: path.resolve(dirname, 'media'),
      },
    },
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Auto-sync the schema in dev/test so no migrations are required for the playground.
    push: true,
  }),
  editor: lexicalEditor(),
  email: testEmailAdapter,
  localization: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
  },
  onInit: async (payload) => {
    await seed(payload)
  },
  plugins: [
    formBuilderPlugin({
      fields: {
        payment: false,
      },
    }),
    hubspotForms({
      collection: 'forms',
    }),
    translator({
      collections: ['posts'],
      globals: [],
      resolvers: [copyResolver()],
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
