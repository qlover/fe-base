import type { PageLayoutProps } from '@/base/types/PageProps';
import { AppPageRouteParams } from '@/server/AppPageRouteParams';
import '@/styles/css/index.css';
import { AdminLayout } from '@/uikit/components/AdminLayout';

export default async function AdminRootLayout({
  children,
  params
}: PageLayoutProps) {
  const pageParams = new AppPageRouteParams(await params!);
  const locale = pageParams.getLocale();

  return (
    <AdminLayout data-testid="AdminRootLayout" lang={locale}>
      {children}
    </AdminLayout>
  );
}
