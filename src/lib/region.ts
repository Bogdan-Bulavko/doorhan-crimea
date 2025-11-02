import { headers } from 'next/headers';
import regions from '@/app/metadata/regions';

export type RegionKey = keyof typeof regions;

export async function getRegionFromHeaders(): Promise<RegionKey> {
  const headersList = await headers();
  const region = headersList.get('x-region') || 'default';
  return (region in regions ? region : 'default') as RegionKey;
}

export function getRegionData(region: RegionKey = 'default') {
  return regions[region] || regions.default;
}

