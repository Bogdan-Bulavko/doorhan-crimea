'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useRegion } from '@/hooks/useRegion';

export default function DynamicMetadata() {
  const { settings } = useSiteSettings();
  const regionData = useRegion();

  useEffect(() => {
    // Приоритет у региональных данных, затем настройки из админки
    const title = settings?.siteTitle || regionData.title;
    const description = settings?.siteDescription || regionData.description;
    const keywords = settings?.siteKeywords || regionData.keywords;

    // Обновляем title
    if (title) {
      document.title = title;
    }

    // Обновляем meta description
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }

    // Обновляем meta keywords
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      } else {
        const keywordsMeta = document.createElement('meta');
        keywordsMeta.name = 'keywords';
        keywordsMeta.content = keywords;
        document.head.appendChild(keywordsMeta);
      }
    }

    // Обновляем Open Graph
    if (title) {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', title);
      }
    }

    if (description) {
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', description);
      }
    }

    if (settings?.siteOgImage) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', settings.siteOgImage);
      }
    }
  }, [settings, regionData]);

  return null;
}
