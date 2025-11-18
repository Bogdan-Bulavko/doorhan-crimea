import { db } from '@/lib/db';
import RegionsList from './RegionsList';

export const dynamic = 'force-dynamic';

export default async function AdminRegionsPage() {
  const regions = await db.region.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return <RegionsList initialRegions={regions} />;
}

