# Release checklist (Obsidian Community)

Use this list before each GitHub release so the [community plugin page](https://community.obsidian.md/plugins/goboard) stays in good standing.

## Developer dashboard

1. Sign in at [community.obsidian.md/account/profile](https://community.obsidian.md/account/profile) and connect GitHub if needed.
2. Confirm the **goboard** project is claimed for `dsokolov/goboard`.
3. Update listing metadata if the release adds user-visible features:
   - Screenshots (empty board, stones, marks, settings, mobile)
   - Short description and categories (Drawing, Markdown)
   - Pricing label: **Free**
4. Run a **preview scan** on the commit or tag you are about to release; resolve any failures before publishing.

## GitHub release

1. Merge all changes to `main`; CI must be green.
2. `npm version patch` (or `minor` / `major`) — updates `package.json`, manifests, and `versions.json`.
3. `git push origin main && git push origin --tags`
4. Wait for the **Release** workflow to finish; confirm the release contains exactly:
   - `main.js`
   - `manifest.json`
   - `styles.css`
5. Do **not** upload or replace release assets manually (that breaks attestation).

## After release

1. Within 24 hours, open [Scorecard](https://community.obsidian.md/plugins/goboard#scorecard) and verify:
   - **Review**: no attestation risks on `main.js` / `styles.css`
   - **Health**: maintenance dates updated
2. If the scorecard looks wrong, ask in `#plugin-dev` on the [Obsidian Discord](https://discord.gg/obsidianmd) with the plugin id `goboard`.
