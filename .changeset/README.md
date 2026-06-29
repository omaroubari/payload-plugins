# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets). Each package
(`payload-hubspot`, `payload-translator`) is versioned and published independently.

- `pnpm changeset` — record a change and choose which packages bump (patch/minor/major).
- `pnpm version-packages` — apply pending changesets, bumping versions and updating changelogs.
- `pnpm release` — build all packages and publish the bumped ones to npm.
