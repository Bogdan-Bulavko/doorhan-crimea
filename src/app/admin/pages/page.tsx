import { db } from '@/lib/db';
import PagesList from './PagesList';

export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  const pages = await db.page.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return <PagesList initialPages={pages} />;
}

