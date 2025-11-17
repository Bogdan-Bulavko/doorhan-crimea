'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function DynamicMetadata() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings) {
      // Обновляем title
      if (settings.siteTitle) {
        document.title = settings.siteTitle;
      }

      // Обновляем meta description
      if (settings.siteDescription) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', settings.siteDescription);
        }
      }

      // Обновляем meta keywords
      if (settings.siteKeywords) {
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
          metaKeywords.setAttribute('content', settings.siteKeywords);
        } else {
          const keywordsMeta = document.createElement('meta');
          keywordsMeta.name = 'keywords';
          keywordsMeta.content = settings.siteKeywords;
          document.head.appendChild(keywordsMeta);
        }
      }

      // Обновляем Open Graph
      if (settings.siteTitle) {
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
          ogTitle.setAttribute('content', settings.siteTitle);
        }
      }

      if (settings.siteDescription) {
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
          ogDescription.setAttribute('content', settings.siteDescription);
        }
      }

      if (settings.siteOgImage) {
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
          ogImage.setAttribute('content', settings.siteOgImage);
        }
      }
    }
  }, [settings]);

  return null;
}
