# Agent Instructions

## Package Manager

Use **pnpm**: `pnpm install`, `pnpm dev`, `pnpm test`

## Validation

Run before completing any change:

```
pnpm lint
pnpm test
pnpm build
```

`pnpm build` runs `tsc` and is the only step that catches type errors — `eslint` does not type-check.

## Unused-code check (`pnpm knip`)

Run occasionally to surface unused files, exports, and dependencies. Not part of the standard validation gate — it's a triage tool. Exits non-zero when issues are found; that's expected.

## Commit Attribution

AI commits MUST include:

```
Co-Authored-By: (the agent model's name and attribution byline)
```

## Visual changes

For UI/visual changes, verify the result with the Chrome DevTools MCP (take a snapshot or screenshot, check console errors). Assume the dev server is already running outside the sandbox — do not start `pnpm dev` yourself.

The dev server runs **outside** the harness sandbox, so the sandbox cannot reach `localhost:5173` over the network — `curl` / `wget` from Bash will fail. **The Chrome DevTools MCP also runs outside the sandbox**, so it CAN reach the dev server. Always reach for the Chrome DevTools MCP for verification; never conclude "the dev server is unreachable" from a sandbox-side probe.

Use `mcp__chrome-devtools__list_pages` / `new_page` / `navigate_page` to drive the browser, then `take_snapshot` (a11y tree, preferred) or `take_screenshot` to inspect, and `list_console_messages` to confirm no errors.

## Committing

Commits are GPG-signed. The sandbox blocks `gpg`'s connection to `keyboxd`, so `git commit` must run with the sandbox disabled.

## Dev seed page (`/dev`)

Available only in `pnpm dev` (Vite DEV); in production the route redirects to `/`. Source: `src/routes/~dev.tsx` and `src/dev/scenarios.tsx`.

Use this to skip the setup flow when reproducing or testing UI on the **ranking** or **score** pages. Each button creates a new Automerge doc via `repo.create`, seeds it with `buildState` (`src/core/mock-factories.ts`), writes the first user's id to `localStorage` under `rank-force-navigator-id` (the stable per-browser navigator id), and navigates to the target route.

- **Jump to ranking**: click **"Impact / Effort — configured (no rankings)"** — seeds 3 users / 6 software-dev items / Impact × Effort dimensions, unranked, lands on `/session/$documentId/ranking`.
- **Jump to score**: click **"Impact / Effort — complete with score"** — same shape with hardcoded, mostly-aligned per-user rankings, lands on `/session/$documentId/score`.

To add a new entry-point shortcut, append to the `scenarios` array in `src/dev/scenarios.tsx` with a `BuildStateOptions` shape and a `target` route id.

The page also has a **Persister round-trip** button that publishes a real Automerge change over MQTT and polls `VITE_SNAPSHOT_URL` — useful for verifying the DDB persister end-to-end.
