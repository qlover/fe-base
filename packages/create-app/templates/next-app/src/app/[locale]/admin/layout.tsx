import type { PageLayoutProps } from '@/base/types/PageProps';
import { PageParams } from '@/server/PageParams';
import '@/styles/css/index.css';
import { AdminLayout } from '@/uikit/components/AdminLayout';

export default async function AdminRootLayout({
  children,
  params
}: PageLayoutProps) {
  const pageParams = new PageParams(await params!);
  const locale = pageParams.getLocale();

  return (
    <AdminLayout data-testid="AdminRootLayout" lang={locale}>
      {children}
    </AdminLayout>
  );
}
