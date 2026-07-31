# @qlover/next-kit

Shared Next.js app shell extracted from `examples/next-seed` / `examples/next-oauth`.

One package with three runtime entries so Node-only and client-only code stay isolated.

## Entries

| Import | Runtime | May use |
|--------|---------|---------|
| `@qlover/next-kit` / `@qlover/next-kit/common` | isomorphic | types, schemas, pure helpers |
| `@qlover/next-kit/server` | Node / Next route handlers | `next/server`, cookies, Node APIs |
| `@qlover/next-kit/client` | Client (`"use client"`) | React hooks, DOM, sonner toasts |

```ts
import { /* ... */ } from '@qlover/next-kit/common';
import { /* ... */ } from '@qlover/next-kit/server';
import { /* ... */ } from '@qlover/next-kit/client';
```

## Dependency rules

```
common → (nothing in this package)
server → common
client → common

server  ↛ client
client  ↛ server
```

The root export (`.`) is **common only**. Import `/server` or `/client` explicitly when needed.

## Peer side effects (app responsibility)

This package does **not** import `reflect-metadata`, and does **not** re-export `inject` / `injectable`. Apps own IOC decorator choice and must import the polyfill at their entry if needed:

```ts
import 'reflect-metadata';
```

Shared validator messages use the **`next_kit:`** key namespace (e.g. `next_kit:v_email_invalid`).

## Why one package (not three)

Same approach as `@qlover/oauth-wrapper` (`server` / `core` / `client`):

- One version bump when a shell bug fix touches types + server + client
- Apps depend on a single package
- Environment isolation via **entry points + directory rules**

## Status

`0.0.1` — `common`, first `server` slice, and first `client` slice. Example rewires come next.

## Develop

```bash
pnpm --filter @qlover/next-kit build
pnpm --filter @qlover/next-kit test
pnpm --filter @qlover/next-kit type-check
```
