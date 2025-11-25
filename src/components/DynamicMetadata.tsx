'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useRegion } from '@/contexts/RegionContext';
import { replaceCityVariables } from '@/lib/template-variables';

export default function DynamicMetadata() {
  const { settings } = useSiteSettings();
  const { currentRegion } = useRegion();
  const pathname = usePathname();

  useEffect(() => {
    // Применяем DynamicMetadata ТОЛЬКО на главной странице
    // Для остальных страниц используем SSR метатеги из generateMetadata()
    const isHomePage = pathname === '/';
    
    if (settings && currentRegion && isHomePage) {
      // Обновляем title с заменой переменных
      if (settings.siteTitle) {
        const title = replaceCityVariables(settings.siteTitle, currentRegion);
        document.title = title;
      }

      // Обновляем meta description с заменой переменных
      if (settings.siteDescription) {
        const description = replaceCityVariables(settings.siteDescription, currentRegion);
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', description);
        }
      }

      // Обновляем meta keywords с заменой переменных
      if (settings.siteKeywords) {
        const keywords = replaceCityVariables(settings.siteKeywords, currentRegion);
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

      // Обновляем Open Graph с заменой переменных
      if (settings.siteTitle) {
        const ogTitle = replaceCityVariables(settings.siteTitle, currentRegion);
        const ogTitleMeta = document.querySelector('meta[property="og:title"]');
        if (ogTitleMeta) {
          ogTitleMeta.setAttribute('content', ogTitle);
        }
      }

      if (settings.siteDescription) {
        const ogDescription = replaceCityVariables(settings.siteDescription, currentRegion);
        const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
        if (ogDescriptionMeta) {
          ogDescriptionMeta.setAttribute('content', ogDescription);
        }
      }

      if (settings.siteOgImage) {
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
          ogImage.setAttribute('content', settings.siteOgImage);
        }
      }
    }
  }, [settings, currentRegion, pathname]);

  return null;
}
