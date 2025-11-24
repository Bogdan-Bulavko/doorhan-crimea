'use client';

import { useEffect } from 'react';

interface CustomAssetsProps {
  customCss?: string | null;
  customJs?: string | null;
}

export default function CustomAssets({ customCss, customJs }: CustomAssetsProps) {
  useEffect(() => {
    // Добавляем кастомный CSS
    if (customCss) {
      const styleId = 'custom-site-css';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = customCss;
    }

    // Добавляем кастомный JS
    if (customJs) {
      const scriptId = 'custom-site-js';
      let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;
      
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        document.body.appendChild(scriptElement);
      }
      
      scriptElement.textContent = customJs;
    }

    // Cleanup при размонтировании
    return () => {
      const styleElement = document.getElementById('custom-site-css');
      if (styleElement) {
        styleElement.remove();
      }
      const scriptElement = document.getElementById('custom-site-js');
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, [customCss, customJs]);

  return null;
}

