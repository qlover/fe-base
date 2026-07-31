# @qlover/next-kit

Shared Next.js app shell extracted from `examples/next-seed` / `examples/next-oauth`.

One package with three runtime entries so Node-only and browser-only code stay isolated.

## Entries

| Import | Runtime | Allowed |
|--------|---------|---------|
| `@qlover/next-kit` / `@qlover/next-kit/common` | isomorphic | types, schemas, pure helpers |
| `@qlover/next-kit/server` | Node / Next route handlers | `next/server`, cookies, Node APIs |
| `@qlover/next-kit/browser` | Client / browser | React client hooks, DOM |

```ts
import { /* ... */ } from '@qlover/next-kit/common';
import { /* ... */ } from '@qlover/next-kit/server';
import { /* ... */ } from '@qlover/next-kit/browser';
```

## Dependency rules

```
common  → (nothing in this package)
server  → common
browser → common

server  ↛ browser
browser ↛ server
```

The root export (`.`) is **common only**. Import `/server` or `/browser` explicitly when needed.

## Why one package

Same pattern as `@qlover/oauth-wrapper` (`server` / `core` / `client`): one version, one dependency for apps, isolation via entry points.

## Status

Scaffold only (`0.0.1`). Example shell code will be migrated in follow-up commits.

## Develop

```bash
pnpm --filter @qlover/next-kit build
pnpm --filter @qlover/next-kit test
pnpm --filter @qlover/next-kit type-check
```
