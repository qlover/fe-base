# next-kit migration checklist

Status of extracting shared Next.js shell code from `examples/next-seed` / `examples/next-oauth`.

## Done in kit

| Area | Items |
|------|--------|
| common | schemas, validators, container, cookies, encryptor, `next_kit:` ids, NextKitApi, I18n/Router/PageI18n interfaces, TranslateI18nUtil, getPagesThemeInitScript |
| server | BootstrapServer, ApiServer, NextApiHandler, CORS/logger/crypto, BaseRepository, SupabaseRepo, RequestLogsRepository |
| client services | LocalStorage, NavigateBridge, I18nService, RouterService, DialogHandler |
| client UI | Loading, With, Button, Modal, DialogUIHost, LocaleLink, ClientRenderProvider, UserAuthFailed, Dropdown, Tooltip, PageI18nProvider, ClientSeo |
| hooks/utils | useStrictEffect, useMountedClient, useReturnTo, useStore/useSliceStoreAdapter, useWarnTranslations, useI18nMapping |
| IOC | `createIOCReact()` factory |

## Examples rewired

Both `examples/next-seed` and `examples/next-oauth` depend on `@qlover/next-kit` (`workspace:*`) and consume kit via:

- Re-exports / thin wrappers under `@/uikit`, `@/impls`, `@schemas`, `@shared/validators`, `server/utils`
- `createIOCReact` + app `ClientIOCRegister`
- Server `BootstrapServer` / `ApiServer` subclasses with app `ServerConfig` + IOC
- `next_kit:*` locale fragments merged in `loadMessages`

**App-owned remains:** Theme/Language switchers, Auth/Logout chrome, RoutePageLayout/BrandMark, Bootstraps, auth forms, OAuth/developer product UI. Both examples use kit `DialogUIHost` (oauth developer pages may still call `DeveloperConfirmDialog` directly).

## Strong candidates (optional later)

| Item | Notes |
|------|--------|
| AppBridge | Wire NavigateBridge ↔ injected router |
| LogoutButton / AuthButton(UI) / useUserAuth | Inject labels + service ports |
| ThemeSwitcher / LanguageSwitcher(+Pages) | Keep in apps (product config) |
| RoutePageLayout | Slots for brand / language / auth |
| Table | Inject pagination labels |
| DialogErrorPlugin | Inject unauthorized key + gotoLogin |
| createRouteGuards | Factory over app route lists |

## Maybe later

BootstrapsProvider / BootstrapClient, AppRoutePage*, AdminLayout, auth forms, supabase SSR helpers.

## Keep in app

OAuth/developer/home/demo/admin product UI, BrandMark, app IOC register bodies, UserService/gateways, page i18n namespaces, theme pink & route lists.
