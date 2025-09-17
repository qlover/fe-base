import { PageParams } from '@/base/cases/PageParams';
import type { PageLayoutProps } from '@/base/types/PageProps';
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
