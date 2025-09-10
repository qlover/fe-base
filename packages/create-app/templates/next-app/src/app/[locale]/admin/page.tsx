'use client';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div data-testid="AdminPage">
      <Link href="/admin/migrations">Migrations</Link>
    </div>
  );
}
