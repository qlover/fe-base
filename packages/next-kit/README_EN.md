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

## Peer side effects (app responsibility)

This package does **not** import `reflect-metadata`, and does **not** re-export `inject` / `injectable` — apps choose their IOC decorators (e.g. `@qlover/corekit-bridge/ioc` or `inversify`). If you use `InversifyContainer` or decorators, import the polyfill once at your app entry:

```ts
import 'reflect-metadata';
```

`InversifyContainer` throws if the polyfill is missing, so the side effect stays out of unrelated client bundles.

Shared validator messages use the **`next_kit:`** key namespace (e.g. `next_kit:v_email_invalid`) so they do not collide with app-local `common:v:*` keys. Apps own the locale strings for these identifiers.

## Why one package

Same pattern as `@qlover/oauth-wrapper` (`server` / `core` / `client`): one version, one dependency for apps, isolation via entry points.

## Status

`0.0.1` — `common` and first `server` slice (`ApiServer`, `SupabaseRepo`, `RequestLogsRepository`, crypto/CORS/logger helpers). `browser` runtime and example rewires come next.

## Develop

```bash
pnpm --filter @qlover/next-kit build
pnpm --filter @qlover/next-kit test
pnpm --filter @qlover/next-kit type-check
```
