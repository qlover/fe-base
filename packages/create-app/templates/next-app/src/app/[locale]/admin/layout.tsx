import type { PageLayoutProps } from '@/base/types/AppPageRouter';
import { AppPageRouteParams } from '@/server/AppPageRouteParams';
import '@/styles/css/index.css';
import { AdminLayout } from '@/uikit/components/AdminLayout';
import { AdminI18nProvider } from './AdminI18nProvider';

export default async function AdminRootLayout({
  children,
  params
}: PageLayoutProps) {
  const pageParams = new AppPageRouteParams(await params!);
  const locale = pageParams.getLocale();

  // Load admin i18n namespaces for admin pages
  // Note: getI18nMessages will merge with default namespaces (common, api)
  // but we only need admin namespaces here since common/api are already in root layout
  const adminNamespaces = ['admin_home', 'admin_locales', 'admin_users'];
  const allMessages = await pageParams.getI18nMessages(adminNamespaces);

  // Extract only admin messages (excluding common and api which are already in root layout)
  // This avoids duplicate messages and ensures we only add what's needed
  const adminMessages = Object.fromEntries(
    Object.entries(allMessages).filter(([key]) =>
      adminNamespaces.some((ns) => key.startsWith(`${ns}:`))
    )
  );

  return (
    <AdminI18nProvider
      data-testid="AdminI18nProvider"
      locale={locale}
      adminMessages={adminMessages}
    >
      <AdminLayout data-testid="AdminRootLayout" lang={locale}>
        {children}
      </AdminLayout>
    </AdminI18nProvider>
  );
}
