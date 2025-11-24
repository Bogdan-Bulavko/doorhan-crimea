'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useRegion } from '@/contexts/RegionContext';
import { replaceCityVariables } from '@/lib/template-variables';

export default function CategoriesSEO() {
  const { settings } = useSiteSettings();
  const { currentRegion } = useRegion();

  useEffect(() => {
    if (settings && currentRegion) {
      // Обновляем title для страницы категорий с заменой переменных
      if (settings.categoriesTitle) {
        const title = replaceCityVariables(settings.categoriesTitle, currentRegion);
        document.title = title;
      }

      // Обновляем meta description с заменой переменных
      if (settings.categoriesDescription) {
        const description = replaceCityVariables(settings.categoriesDescription, currentRegion);
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', description);
        }
      }

      // Обновляем meta keywords с заменой переменных
      if (settings.categoriesKeywords) {
        const keywords = replaceCityVariables(settings.categoriesKeywords, currentRegion);
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
      if (settings.categoriesTitle) {
        const ogTitle = replaceCityVariables(settings.categoriesTitle, currentRegion);
        const ogTitleMeta = document.querySelector('meta[property="og:title"]');
        if (ogTitleMeta) {
          ogTitleMeta.setAttribute('content', ogTitle);
        }
      }

      if (settings.categoriesDescription) {
        const ogDescription = replaceCityVariables(settings.categoriesDescription, currentRegion);
        const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
        if (ogDescriptionMeta) {
          ogDescriptionMeta.setAttribute('content', ogDescription);
        }
      }
    }
  }, [settings, currentRegion]);

  return null;
}

