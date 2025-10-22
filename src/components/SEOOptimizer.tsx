'use client';

import { useEffect } from 'react';

interface SEOOptimizerProps {
  productName: string;
  productDescription: string;
  productImages: string[];
  productPrice: string;
  productCategory: string;
}

export default function SEOOptimizer({
  productName,
  productDescription,
  productImages,
  productPrice,
  productCategory
}: SEOOptimizerProps) {
  
  useEffect(() => {
    // Проверяем и исправляем структуру заголовков
    const optimizeHeadings = () => {
      const h1Elements = document.querySelectorAll('h1');
      const h2Elements = document.querySelectorAll('h2');
      const h3Elements = document.querySelectorAll('h3');
      
      console.log('🔍 SEO Анализ:');
      console.log(`H1: ${h1Elements.length} (должно быть 1)`);
      console.log(`H2: ${h2Elements.length} (рекомендуется 3-5)`);
      console.log(`H3: ${h3Elements.length} (рекомендуется 5-10)`);
      
      // Исправляем множественные H1
      if (h1Elements.length > 1) {
        console.warn('⚠️ Найдено несколько H1, исправляем...');
        for (let i = 1; i < h1Elements.length; i++) {
          const h1 = h1Elements[i] as HTMLElement;
          const h2 = document.createElement('h2');
          h2.innerHTML = h1.innerHTML;
          h2.className = h1.className.replace('text-3xl', 'text-2xl');
          h1.parentNode?.replaceChild(h2, h1);
        }
      }
      
      // Группируем H2 если их слишком много
      if (h2Elements.length > 6) {
        console.warn('⚠️ Слишком много H2, группируем...');
        const h2Array = Array.from(h2Elements);
        h2Array.forEach((h2, index) => {
          if (index > 5) {
            const h2Element = h2 as HTMLElement;
            const h3 = document.createElement('h3');
            h3.innerHTML = h2Element.innerHTML;
            h3.className = h2Element.className.replace('text-2xl', 'text-xl');
            h2Element.parentNode?.replaceChild(h3, h2Element);
          }
        });
      }
    };

    // Оптимизируем изображения
    const optimizeImages = () => {
      const images = document.querySelectorAll('img');
      console.log(`🖼️ Изображения: ${images.length}`);
      
      images.forEach((img, index) => {
        const imgElement = img as HTMLImageElement;
        
        // Добавляем alt если его нет
        if (!imgElement.alt) {
          imgElement.alt = `${productName} - изображение ${index + 1}`;
        }
        
        // Добавляем loading="lazy" для производительности
        if (!imgElement.loading) {
          imgElement.loading = 'lazy';
        }
        
        // Добавляем размеры для предотвращения layout shift
        if (!imgElement.width || !imgElement.height) {
          imgElement.style.aspectRatio = '16/9';
        }
      });
    };

    // Оптимизируем ссылки
    const optimizeLinks = () => {
      const links = document.querySelectorAll('a');
      console.log(`🔗 Ссылки: ${links.length}`);
      
      if (links.length > 20) {
        console.warn('⚠️ Слишком много ссылок, это может влиять на SEO');
      }
      
      links.forEach(link => {
        const linkElement = link as HTMLAnchorElement;
        
        // Добавляем rel="nofollow" для внешних ссылок
        if (linkElement.href && !linkElement.href.includes(window.location.hostname)) {
          linkElement.rel = 'nofollow';
        }
        
        // Добавляем title для лучшего UX
        if (!linkElement.title) {
          linkElement.title = linkElement.textContent || 'Ссылка';
        }
      });
    };

    // Проверяем мета-теги
    const checkMetaTags = () => {
      const title = document.querySelector('title');
      const description = document.querySelector('meta[name="description"]');
      
      console.log('📝 Мета-теги:');
      console.log(`Title: ${title?.textContent || 'Нет'}`);
      console.log(`Description: ${description?.getAttribute('content') || 'Нет'}`);
      
      // Рекомендации по длине
      if (title && title.textContent && title.textContent.length > 60) {
        console.warn('⚠️ Title слишком длинный (>60 символов)');
      }
      
      if (description && description.getAttribute('content') && 
          description.getAttribute('content')!.length > 160) {
        console.warn('⚠️ Description слишком длинный (>160 символов)');
      }
    };

    // Запускаем оптимизацию
    setTimeout(() => {
      optimizeHeadings();
      optimizeImages();
      optimizeLinks();
      checkMetaTags();
    }, 1000);
  }, [productName, productDescription, productImages, productPrice, productCategory]);

  return null; // Компонент не рендерит ничего
}

// Хук для SEO анализа
export const useSEOAnalysis = () => {
  const analyzePage = () => {
    const analysis = {
      headings: {
        h1: document.querySelectorAll('h1').length,
        h2: document.querySelectorAll('h2').length,
        h3: document.querySelectorAll('h3').length,
        h4: document.querySelectorAll('h4').length,
        h5: document.querySelectorAll('h5').length,
        h6: document.querySelectorAll('h6').length,
      },
      images: document.querySelectorAll('img').length,
      links: document.querySelectorAll('a').length,
      issues: [] as string[]
    };

    // Проверяем проблемы
    if (analysis.headings.h1 > 1) {
      analysis.issues.push('Слишком много H1 заголовков');
    }
    
    if (analysis.headings.h2 > 6) {
      analysis.issues.push('Слишком много H2 заголовков');
    }
    
    if (analysis.images < 3) {
      analysis.issues.push('Мало изображений для товарной страницы');
    }
    
    if (analysis.links > 20) {
      analysis.issues.push('Слишком много ссылок');
    }

    return analysis;
  };

  return { analyzePage };
};
