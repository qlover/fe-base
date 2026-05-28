import { REQUEST_LOG_RECORD_TYPE_DEMO_OAUTH } from '@schemas/RequestLogSchema';

/** Returns demo-oauth record type when `pathname` is an OAuth-related route in this app. */
export function resolveDemoOAuthRequestLogRecordType(
  pathname: string
): typeof REQUEST_LOG_RECORD_TYPE_DEMO_OAUTH | null {
  const path = pathname.split('?')[0]?.replace(/\/+$/, '') || '/';
  if (
    path === '/userinfo' ||
    path.startsWith('/oauth') ||
    path.startsWith('/api/oauth') ||
    path.startsWith('/api/clients') ||
    path === '/api/oauth/verify'
  ) {
    return REQUEST_LOG_RECORD_TYPE_DEMO_OAUTH;
  }
  return null;
}
