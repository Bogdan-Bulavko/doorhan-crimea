import { db } from './db';

export type SiteSettingsMap = Record<string, string | null>;

export async function getSiteSettings(): Promise<SiteSettingsMap> {
  const settings = await db.siteSetting.findMany({
    orderBy: { key: 'asc' },
  });

  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as SiteSettingsMap);
}

