'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function CatalogSEO() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings) {
      // Обновляем title для страницы каталога
      if (settings.catalogTitle) {
        document.title = settings.catalogTitle;
      }

      // Обновляем meta description
      if (settings.catalogDescription) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', settings.catalogDescription);
        }
      }

      // Обновляем meta keywords
      if (settings.catalogKeywords) {
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
          metaKeywords.setAttribute('content', settings.catalogKeywords);
        } else {
          const keywordsMeta = document.createElement('meta');
          keywordsMeta.name = 'keywords';
          keywordsMeta.content = settings.catalogKeywords;
          document.head.appendChild(keywordsMeta);
        }
      }

      // Обновляем Open Graph
      if (settings.catalogTitle) {
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
          ogTitle.setAttribute('content', settings.catalogTitle);
        }
      }

      if (settings.catalogDescription) {
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
          ogDescription.setAttribute('content', settings.catalogDescription);
        }
      }
    }
  }, [settings]);

  return null;
}
