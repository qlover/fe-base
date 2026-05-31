# @qlover/oauth-wrapper

> 中文: [README.md](./README.md)

Provider-agnostic **OAuth 2.0 authorization server core**: authorization code flow, PKCE, consent orchestration, token exchange, userinfo mapping, and OAuth client management.

Integrate any user system via `OAuthUserAdapterInterface`, storage via `OAuthWrapperRepositoryInterface`, and sessions via `OAuthSessionInterface`. This package does **not** ship concrete adapters, databases, or web framework routes.

## Install

```bash
pnpm add @qlover/oauth-wrapper zod
```

## Quick start

```ts
import {
  OAuthWrapperService,
  OAuthTokenService,
  OAuthClientsService,
  type OAuthUserAdapterInterface,
  type OAuthWrapperRepositoryInterface,
  type OAuthSessionInterface,
  OAuthRfcCodes
} from '@qlover/oauth-wrapper';
```

Wire your three ports, compose `OAuthWrapperService`, and mount handlers in any HTTP framework.

See `examples/next-oauth-wrapper` in this monorepo for a full reference deployment.
