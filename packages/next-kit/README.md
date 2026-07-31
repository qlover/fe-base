# @qlover/next-kit

Shared Next.js app shell extracted from `examples/next-seed` / `examples/next-oauth`.

One package, three runtime entries — so Node-only and browser-only code never get mixed by accident.

## Entries

| Import | Runtime | May use |
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
common  ──► (nothing in this package)
server  ──► common
browser ──► common

server  ✕── browser
browser ✕── server
```

Root export (`.`) is **common only**. Always import `/server` or `/browser` explicitly when you need those runtimes.

## Why one package (not three)

Same approach as `@qlover/oauth-wrapper` (`server` / `core` / `client`):

- One version bump when a shell bug fix touches types + server + client
- Apps depend on a single package
- Environment isolation is enforced by **entry points + directory rules**, not by splitting publish units

## Status

Scaffold only (`0.0.1`). Shell code from examples will be migrated in follow-up commits.

## Develop

```bash
pnpm --filter @qlover/next-kit build
pnpm --filter @qlover/next-kit test
pnpm --filter @qlover/next-kit type-check
```
