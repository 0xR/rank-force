# rank-force

A Vite + React + TypeScript app deployed with [SST](https://sst.dev). Local
collaboration uses Automerge over a BroadcastChannel and is persisted to
IndexedDB.

## Getting started

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs `sst dev`, which starts the Vite dev server alongside any local
SST resources.

## Scripts

### Build & deploy

| Script             | What it does                          |
| ------------------ | ------------------------------------- |
| `pnpm build`       | Type-check, then build with Vite.     |
| `pnpm preview`     | Serve the production build locally.   |
| `pnpm deploy`      | Deploy with SST to the default stage. |
| `pnpm deploy:prd`  | Deploy with SST to the `prd` stage.   |
| `pnpm types:watch` | Watch-mode TypeScript type checking.  |

### Lint & format

ESLint enforces code correctness; Prettier owns formatting. The two are kept
out of each other's way via [`eslint-config-prettier`][ecp], which disables
any ESLint rules that would conflict with Prettier.

| Script              | What it does                                                      |
| ------------------- | ----------------------------------------------------------------- |
| `pnpm lint`         | Run ESLint on `.ts`/`.tsx` files (no warnings allowed).           |
| `pnpm lint:fix`     | Run ESLint with `--fix`.                                          |
| `pnpm format`       | Format the repo with Prettier (`prettier --write .`).             |
| `pnpm format:check` | Verify formatting without writing changes (`prettier --check .`). |
| `pnpm check`        | CI-style gate: `format:check` + `lint`.                           |
| `pnpm fix`          | Apply both `format` and `lint:fix`.                               |

A pre-commit hook (Husky + lint-staged) runs ESLint and Prettier on staged
files automatically, so you generally don't need to invoke these scripts by
hand.

[ecp]: https://github.com/prettier/eslint-config-prettier

### Tests

| Script               | What it does                     |
| -------------------- | -------------------------------- |
| `pnpm test`          | Run Vitest unit tests once.      |
| `pnpm test:watch`    | Vitest in watch mode.            |
| `pnpm test:ui`       | Vitest with the UI.              |
| `pnpm playwright`    | Run Playwright end-to-end tests. |
| `pnpm playwright:ui` | Playwright with the UI.          |

## Configuration

- Prettier: `.prettierrc.json`, ignore list in `.prettierignore`.
- ESLint: `.eslintrc.cjs` (extends `prettier` last so formatting rules don't
  clash).
- Husky hooks: `.husky/`.
