# Agent Instructions

## Package Manager

Use **pnpm**: `pnpm install`, `pnpm dev`, `pnpm test`

## Validation

Run before completing any change:

```
pnpm lint
pnpm test
```

## Commit Attribution

AI commits MUST include:

```
Co-Authored-By: (the agent model's name and attribution byline)
```

## Committing

Commits are GPG-signed. The sandbox blocks `gpg`'s connection to `keyboxd`, so `git commit` must run with the sandbox disabled.
