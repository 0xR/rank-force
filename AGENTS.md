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

## Commit Attribution

AI commits MUST include:

```
Co-Authored-By: (the agent model's name and attribution byline)
```

## Committing

Commits are GPG-signed. The sandbox blocks `gpg`'s connection to `keyboxd`, so `git commit` must run with the sandbox disabled.

## Dev seed page (`/dev`)

Available only in `pnpm dev` (Vite DEV); in production the route redirects to `/`. Source: `src/routes/~dev.tsx` and `src/dev/scenarios.tsx`.

Use this to skip the setup flow when reproducing or testing UI on the **ranking** or **score** pages. Each button creates a new Automerge doc via `repo.create`, seeds it with `buildState` (`src/core/mock-factories.ts`), writes the first user's id to `localStorage` under `rank-force-<documentId>-userid`, and navigates to the target route.

- **Jump to ranking**: click **"Configured (no rankings)"** — seeds 3 users / 4 items / 2 dimensions, unranked, lands on `/session/$documentId/ranking`.
- **Jump to score**: click **"Complete with score"** — same shape but fully ranked, lands on `/session/$documentId/score`.

To add a new entry-point shortcut, append to the `scenarios` array in `src/dev/scenarios.tsx` with a `BuildStateOptions` shape and a `target` route id.

The page also has a **Persister round-trip** button that publishes a real Automerge change over MQTT and polls `VITE_SNAPSHOT_URL` — useful for verifying the DDB persister end-to-end.
