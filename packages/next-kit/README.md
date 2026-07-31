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

## Peer side effects (app responsibility)

This package does **not** import `reflect-metadata`, and does **not** re-export `inject` / `injectable` — apps choose their IOC decorators (e.g. `@qlover/corekit-bridge/ioc` or `inversify`). If you use {@link InversifyContainer} or decorators, import the polyfill once at your app entry:

```ts
import 'reflect-metadata';
```

`InversifyContainer` will throw a clear error if the polyfill is missing. Keeping the side-effect out of the kit avoids pulling it into unrelated client bundles.

Shared validator messages use the **`next_kit:`** key namespace (e.g. `next_kit:v_email_invalid`) so they do not collide with app-local `common:v:*` keys. Apps own the locale strings for these identifiers.

## Why one package (not three)

Same approach as `@qlover/oauth-wrapper` (`server` / `core` / `client`):

- One version bump when a shell bug fix touches types + server + client
- Apps depend on a single package
- Environment isolation is enforced by **entry points + directory rules**, not by splitting publish units

## Status

`0.0.1` — `common` now includes container, schemas, validators, cookies, `StringEncryptor`, `Datetime`, and supabase env constants. `server` / `browser` runtimes and example rewires come next.

## Develop

```bash
pnpm --filter @qlover/next-kit build
pnpm --filter @qlover/next-kit test
pnpm --filter @qlover/next-kit type-check
```
