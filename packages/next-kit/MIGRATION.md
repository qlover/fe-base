# next-kit migration checklist

Status of extracting shared Next.js shell code from `examples/next-seed` / `examples/next-oauth`.

## Done in kit

| Area | Items |
|------|--------|
| common | schemas, validators, container, cookies, encryptor, `next_kit:` ids, NextKitApi, I18n/Router/PageI18n interfaces |
| server | BootstrapServer, ApiServer, NextApiHandler, CORS/logger/crypto, BaseRepository, SupabaseRepo, RequestLogsRepository |
| client services | LocalStorage, NavigateBridge, I18nService, RouterService, DialogHandler |
| client UI | Loading, With, Button, Modal, DialogUIHost, LocaleLink, ClientRenderProvider, UserAuthFailed, Dropdown, Tooltip, PageI18nProvider, ClientSeo |
| hooks/utils | useStrictEffect, useMountedClient, useReturnTo, useStore/useSliceStoreAdapter, useWarnTranslations, useI18nMapping, getPagesThemeInitScript |
| IOC | `createIOCReact()` factory |
| i18n | TranslateI18nUtil |

## Strong candidates (next / medium)

| Item | Notes |
|------|--------|
| AppBridge | Wire NavigateBridge ↔ injected router |
| LogoutButton / AuthButton(UI) / useUserAuth | Inject labels + service ports |
| ThemeSwitcher / LanguageSwitcher(+Pages) | Inject themes/locales; peers `@wrksz/themes`, next-intl |
| RoutePageLayout | Slots for brand / language / auth |
| Table | Inject pagination labels |
| DialogErrorPlugin | Inject unauthorized key + gotoLogin |
| createRouteGuards | Factory over app route lists |
| Shell URL/locale defaults | Extend common defaults; apps override |

## Maybe later

BootstrapsProvider / BootstrapClient, AppRoutePage*, AdminLayout, auth forms, supabase SSR helpers, FeatureItem, auth provider icons.

## Keep in app

OAuth/developer/home/demo/admin product UI, BrandMark, app IOC register bodies, UserService/gateways, page i18n namespaces, theme pink & route lists.

## After kit extract

Rewire examples → `@qlover/next-kit/*` and delete local duplicates (still pending).
