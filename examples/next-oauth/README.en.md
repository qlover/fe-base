# Next OAuth (`examples/next-oauth`)

> 中文: [README.md](./README.md)

**Template**: Next.js OAuth 2.0 authorization server example. Protocol core from `@qlover/oauth-wrapper`; this app wires session, storage, and upstream providers.

**Two predefined upstreams** (env / IOC switch; **default unchanged**):

| Option | Value | Notes |
| ------ | ----- | ----- |
| **Supabase (default)** | `supabase` | Email/password, OTP, GitHub/Google SSO |
| **Brain User (optional)** | `brain-user` | Wrap an existing login API as OAuth credentials |

```bash
OAUTH_UPSTREAM_PROVIDER=supabase
NEXT_PUBLIC_OAUTH_UPSTREAM_PROVIDER=supabase
```

See `server/serverIoc.ts` and `server/providers/*`.

**TL;DR**: `npm install` → copy `.env.template` to `.env` → run `makes/sql/` on Supabase → `npm run dev` (port **3300**) → production: `npm run build` then `npm start`.

**Docs**: In-app OAuth guide at `/[locale]/docs/oauth`; i18n conventions in [docs/i18n.en.md](./docs/i18n.en.md).

---

## Tech Stack

| Category        | Technologies |
| --------------- | ------------ |
| **Framework**   | Next.js 16, App Router, React 19 |
| **OAuth**       | `shared/oauth-wrapper` (authorization code, PKCE, token, userinfo) |
| **Validation**  | Zod |
| **Data**        | Supabase |
| **Reference upstream** | `@brain-toolkit/brain-user` (`BrainUserAdapter`, swappable) |
| **UI**          | Ant Design 5, Tailwind CSS 4 |
| **i18n**        | next-intl |
| **DI**          | Inversify, SimpleIOCContainer |
| **Quality**     | TypeScript 5, ESLint, Prettier, Vitest |

**Runtime:** Node.js ^20.17.0 or >=22.9.0, npm >=10.0.0.

---

## OAuth Wrapper: Architecture

### Two layers

| Layer | Path | Role |
| ----- | ---- | ---- |
| **Reusable core** | `shared/oauth-wrapper/` | RFC 6749 flows, PKCE, consent, token exchange, userinfo — **no** dependency on a specific login API |
| **This example** | `server/providers`, `server/adapters`, `server/repositorys`, `src/app` | HttpOnly session cookie, Supabase persistence, adapter, Next routes and UI |

To change the user system, replace the **adapter + Provider class + IOC binding**; keep `OAuthWrapperService` stable when possible.

### Core modules (`shared/oauth-wrapper/`)

| Path | Description |
| ---- | ----------- |
| `interfaces/OAuthUserAdapterInterface.ts` | Upstream port: `login`, `exchangeAccessToken`, `getUserInfo`, `getUserInfoByAccessToken` |
| `interfaces/OAuthWrapperRepositoryInterface.ts` | Auth codes, refresh tokens, clients, stored credentials |
| `interfaces/OAuthSessionInterface.ts` | Logged-in session for the authorize page (JWT cookie in this demo) |
| `services/OAuthWrapperService.ts` | Authorize validation, consent, token delegation, userinfo |
| `services/OAuthTokenService.ts` | `authorization_code` / `refresh_token` grants |
| `schema/`, `utils/` | Zod schemas, PKCE, redirect helpers |

```ts
import {
  OAuthWrapperService,
  OAuthTokenService,
  OAuthUserAdapterInterface
} from '@shared/oauth-wrapper';
```

### Wiring in this repo

- **Provider**: `server/providers/BrainUserOAuthProvider.ts` — `extends OAuthWrapperService`, injects session, `BrainUserAdapter`, `OAuthWrapperRepository`, `OAuthTokenService`.
- **IOC**: `server/serverIoc.ts` binds `I.OAuthWrapperProviderInterface` → `BrainUserOAuthProvider`.
- **Login orchestration**: `server/services/OAuthControllerService.ts` — session + `upsertUserCredentials` after `adapter.login`.
- **HTTP**: `server/controllers/OAuthWrapperController.ts`.

Machine endpoints (no locale, skip session middleware in `src/proxy.ts`):

- `POST /oauth/token`
- `GET /userinfo`

---

## Quick Start

```bash
cd examples/next-oauth-wrapper
npm install
cp .env.template .env
```

**OAuth-related env** (see `.env.template`):

| Variable | Purpose |
| -------- | ------- |
| `SITE_URL` | Public site URL |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Supabase connection (OAuth table access) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Optional** — only when OAuth tables use RLS without policies that allow your server role |
| `SESSION_SECRET` | Signs HttpOnly OAuth authorize session cookie |
| `ENCRYPTION_KEY` | Encrypts upstream refresh tokens at rest |
| `OAUTH_WRAPPER_API_BASE` | Upstream user API base (Brain User in the default adapter) |
| `OAUTH_WRAPPER_API_TIMEOUT` | Upstream timeout ms (default `10000`) |

**Database:** run `makes/sql/001-base-tables.sql` then `002-oauth-clients.sql` in Supabase. If OAuth tables have **no RLS**, `SUPABASE_ANON_KEY` is enough; `SUPABASE_SERVICE_ROLE_KEY` is only needed when RLS blocks anon writes (the bundled `002` script enables RLS by default—skip or adjust if that does not match your deployment). `createAdminClient()` prefers service role, then falls back to anon.

**Run:** `npm run dev` → `http://localhost:3102`.

**Suggested first run:**

1. Sign in at `/auth/login` or `POST /api/oauth/verify`.
2. Create a client at `/{locale}/developer/apps`.
3. Try `/{locale}/oauth/playground` or a real redirect to `/{locale}/oauth/authorize`.

---

## Using OAuth Wrapper End-to-End

### Supported today

- `response_type=code`, **PKCE S256** (required for public clients)
- `grant_type=authorization_code`, `grant_type=refresh_token`
- `GET /userinfo` with Bearer token

### Endpoints

| Endpoint | Method | Notes |
| -------- | ------ | ----- |
| `/[locale]/oauth/authorize` | GET | Consent UI (requires session) |
| `/api/oauth/verify` | POST | Email/password login → session + stored upstream tokens |
| `/api/oauth/consent` | POST | Approve/deny → `redirectUrl` with `code` or OAuth error |
| `/oauth/token` | POST | Token endpoint (form body, optional HTTP Basic) |
| `/userinfo` | GET | Bearer access token |
| `/api/clients` | GET/POST | Manage clients (authenticated) |

Constants: `shared/config/route.ts`, `shared/config/apiRoutes.ts`.

---

## Integrate OAuth login in your app

Use this deployment as the **authorization server**. End users sign in on **this site** (`/auth/login`), not by posting passwords to your app. Your app redirects, receives `code` on `redirect_uri`, and exchanges it for tokens **on your backend** (recommended).

### Prerequisites

1. Set `SITE_URL` (e.g. `http://localhost:3102`).
2. Sign in, create a client at `/{locale}/developer/apps`: `client_id`, `redirect_uri`, scopes, and `client_secret` (confidential clients only).
3. Public clients (SPA/native): **PKCE required**, no `client_secret` at token endpoint.

| Step | URL |
| ---- | --- |
| Authorize (browser) | `{SITE_URL}/{locale}/oauth/authorize` |
| Token | `POST {SITE_URL}/oauth/token` |
| Userinfo | `GET {SITE_URL}/userinfo` |

### Minimal Express client (see Chinese [README.md](./README.md) for full listing)

1. `GET /login` — generate `state` + PKCE, redirect to `{SITE_URL}/zh/oauth/authorize?...`
2. `GET /oauth/callback` — verify `state`, `POST /oauth/token` with `code` + `code_verifier`
3. `GET /userinfo` with `Bearer access_token`, then create **your** session

Store `code_verifier` server-side; never expose `client_secret` to the browser. Unauthenticated authorize visits redirect to `/auth/login?redirect=...` and return after login.

Helpers in-repo: `src/uikit/utils/oauthPlaygroundUtils.ts` (`buildAuthorizeUrl`, `parseOAuthCallbackUrl`). In-app tester: `/{locale}/oauth/playground`.

### Authorization code + PKCE (protocol detail)

1. Register a client in the developer console; note `client_id`, `redirect_uri`, and `client_secret` (confidential clients).
2. Redirect the user to authorize, e.g.:

   ```
   GET {SITE_URL}/en/oauth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=openid%20profile%20email&state=...&code_challenge=...&code_challenge_method=S256
   ```

3. Ensure the user has a site session (`/auth/login` or `POST /api/oauth/verify`).
4. User consents → browser returns to `redirect_uri?code=...&state=...`.
5. Backend exchanges the code:

   ```bash
   curl -X POST http://localhost:3102/oauth/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code&code=CODE&redirect_uri=URI&client_id=ID&code_verifier=VERIFIER"
   ```

6. Call userinfo:

   ```bash
   curl http://localhost:3102/userinfo -H "Authorization: Bearer ACCESS_TOKEN"
   ```

PKCE helpers: `@shared/oauth-wrapper/utils/pkce`. In-app testing: `OAuthPlayground` at `/{locale}/oauth/playground`.

### Swap the upstream user API (minimal diff)

OAuth routes stay unchanged. Smallest integration: **one Adapter file**, **one Provider file** (copy of `BrainUserOAuthProvider` with your adapter type), **one IOC line**.

| Step | File |
| ---- | ---- |
| 1 | `server/adapters/AcmeUserAdapter.ts` — implement `OAuthUserAdapterInterface` (`login`, `exchangeAccessToken`, `getUserInfo`, `getUserInfoByAccessToken`) |
| 2 | `server/providers/AcmeOAuthProvider.ts` — copy `BrainUserOAuthProvider.ts`, inject `AcmeUserAdapter` instead of `BrainUserAdapter` |
| 3 | `server/serverIoc.ts` — `ioc.bind(I.OAuthWrapperProviderInterface, ioc.get(AcmeOAuthProvider))` |

Adapter contract (used by `OAuthControllerService.verifyLogin`):

- `login` → `{ token: string }` (upstream session token)
- `exchangeAccessToken` → `{ access_token, expires_in, refresh_token? }`
- Profiles need a numeric `id` and non-empty `email`

Example stub (see Chinese [README.md](./README.md) for the full `AcmeUserAdapter` listing):

```ts
@injectable()
export class AcmeUserAdapter implements OAuthUserAdapterInterface {
  async login(email, password) {
    const data = await fetch(`${process.env.ACME_API_BASE}/login`, { /* … */ }).then((r) => r.json());
    return { token: data.session_token };
  }
  // exchangeAccessToken, getUserInfo, getUserInfoByAccessToken — call your API, map to OAuthUserProfile
}
```

Do **not** change `shared/oauth-wrapper`, repositories, controllers, or routes unless your login flow differs from the default `OAuthControllerService`.

---

## Project Layers (summary)

- **`shared/oauth-wrapper/`** — OAuth protocol core (portable).
- **`server/`** — Controllers, `OAuthWrapperRepository`, `OAuthSessionService`, providers, adapters, `serverIoc.ts`.
- **`src/`** — App Router pages, machine routes, `OAuthWrapperGateway`, UI under `uikit/components-app/oauth/`.
- **`shared/`** (elsewhere) — App-wide interfaces, schemas, config, IOC identifiers.

### Front–back in one Next process

Pages and Gateways call `/api/*`; third parties call `/oauth/token` and `/userinfo` on the same origin. `npm run dev` serves everything on port **3102**.

### Interface-first

Read `OAuthServiceInterface` and `OAuthUserAdapterInterface` in `@shared/oauth-wrapper` before opening implementations. API routes resolve `OAuthWrapperController` via `NextApiServer` + server IOC; the browser uses `OAuthWrapperGateway` for verify/consent.

---

**Summary:** **`shared/oauth-wrapper`** is the reusable OAuth server core; this example wires **Brain User** via `BrainUserAdapter` and Supabase. Use **`npm run dev`** on port **3102** to exercise the full flow including Playground and machine endpoints.
