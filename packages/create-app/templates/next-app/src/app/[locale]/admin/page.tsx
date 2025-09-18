import type { Metadata } from 'next';

function AdminPageClient() {
  return <div data-testid="AdminPage">Admin Page</div>;
}

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing application resources',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return (
    <div data-testid="AdminPageWrapper">
      <AdminPageClient />
    </div>
  );
}
