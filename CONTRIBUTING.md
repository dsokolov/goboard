# Contributing to GoBoard

Thank you for your interest in improving GoBoard.

## Development setup

- **Node.js**: use the version from [`.nvmrc`](.nvmrc) (24.x).
- Install dependencies: `npm ci`
- Dev build (watch): `npm run dev`
- Production build: `npm run build`
- Tests: `npm test`
- Lint: `npm run lint`

Source code lives in [`src/`](src/). Build artifacts (`main.js`, `manifest.json`, `styles.css`) are written to [`plugin-dist/`](plugin-dist/) and copied to the dev vault when building.

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Make your changes; keep the scope focused.
3. Ensure `npm run lint` and `npm test` pass.
4. Open a pull request with a clear description of the change and how to test it.

Please follow the [Obsidian plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines) and [Developer policies](https://docs.obsidian.md/Developer+policies).

## Reporting issues

- **Bugs**: use the [Bug Report](https://github.com/dsokolov/goboard/issues/new?template=bug_report.md) template.
- **Features**: use the [Feature Request](https://github.com/dsokolov/goboard/issues/new?template=feature_request.md) template.

## Releases

Releases are **not** built or uploaded manually. When a version is ready:

1. Bump the version with `npm version patch` (or `minor` / `major`) — this updates `package.json`, `manifest.json`, and `versions.json`, and creates an **annotated git tag without a `v` prefix** (e.g. `1.0.2`, same as in `manifest.json`). See [`.npmrc`](.npmrc).
2. Push the commit and tag: `git push origin main && git push origin --tags`
3. The [Release workflow](.github/workflows/release.yml) builds the plugin, attaches `main.js`, `manifest.json`, and `styles.css` to the GitHub release, and creates [build provenance attestations](https://docs.github.com/en/actions/security-guides/using-artifact-attestations-to-establish-provenance-for-builds).

Before publishing a release, run a **preview scan** in the [Obsidian Community developer dashboard](https://community.obsidian.md/account/profile) on the release tag.

## Community plugin page

Plugin listing: [community.obsidian.md/plugins/goboard](https://community.obsidian.md/plugins/goboard)

Maintainers should keep the developer dashboard metadata up to date (screenshots, description, categories). See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) before each release.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.
