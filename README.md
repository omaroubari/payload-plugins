# payload-plugins

A monorepo of [Payload CMS](https://payloadcms.com) plugins, each published independently to npm.

## Packages

| Package                                          | Description                                                                  |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| [`payload-hubspot`](packages/hubspot)            | Sync HubSpot forms into the Form Builder collection.                         |
| [`payload-translator`](packages/translator)      | Translate localized documents/globals via pluggable resolvers.               |

## Repository layout

```
payload-plugins/
├── packages/
│   ├── hubspot/        # payload-hubspot
│   ├── iconify/        # payload-iconify
│   └── translator/     # payload-translator
├── dev/                # shared Payload app for local testing (mounts every plugin)
├── tsconfig.base.json  # shared TS compiler options
├── .swcrc              # shared SWC build config
├── .changeset/         # independent versioning per package
└── pnpm-workspace.yaml
```

## Development

Requires Node ^18.20.2 || >=20.9.0, pnpm 9/10, and a PostgreSQL database for the dev app.

```sh
pnpm install
cp dev/.env.example dev/.env    # then set DATABASE_URI / PAYLOAD_SECRET
pnpm dev                        # run the shared admin (mounts all plugins)
pnpm build                      # build every package to its dist/
pnpm lint                       # lint all packages
pnpm test:int                   # integration tests (requires Postgres)
pnpm test:e2e                   # e2e tests (requires Postgres)
```

The `dev/` app imports each plugin from its workspace package, so changes to a plugin's
`src/` are picked up directly — no rebuild needed while developing.

## Releasing

Versioning is handled with [Changesets](https://github.com/changesets/changesets); each
package versions and publishes on its own.

```sh
pnpm changeset          # record what changed and pick the bump per package
pnpm version-packages   # apply changesets (bump versions + changelogs)
pnpm release            # build, then publish bumped packages to npm
```

## License

MIT
