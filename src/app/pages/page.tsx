import { db } from '@/lib/db';
import { Metadata } from 'next';
import Link from 'next/link';
import BreadCrumbs from '@/components/BreadCrumbs';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Страницы | DoorHan Крым',
  description: 'Информационные страницы DoorHan Крым. Политика конфиденциальности, условия использования, контакты и другая полезная информация.',
  keywords: 'DoorHan Крым, страницы, информация, политика конфиденциальности, контакты',
  openGraph: {
    title: 'Страницы | DoorHan Крым',
    description: 'Информационные страницы DoorHan Крым',
    url: 'https://doorhan-crimea.ru/pages',
    siteName: 'DoorHan Крым',
    locale: 'ru_RU',
    type: 'website',
  },
  alternates: {
    canonical: 'https://doorhan-crimea.ru/pages',
  },
};

export default async function PagesListPage() {
  const pages = await db.page.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { sortOrder: 'asc' },
      { title: 'asc' },
    ],
  });

  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Страницы', href: '/pages' },
  ];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BreadCrumbs items={breadcrumbs} />
        
        <div className="mt-8">
          <h1 className="text-4xl font-bold text-[#00205B] mb-2">
            Информационные страницы
          </h1>
          <p className="text-gray-600 mb-8">
            Полезная информация о нашей компании, политиках и условиях использования
          </p>

          {pages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Страницы пока не добавлены</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pages.map((page) => {
                // Получаем краткое описание из контента (первые 150 символов)
                const preview = page.content
                  .replace(/[#*`]/g, '')
                  .replace(/\n/g, ' ')
                  .trim()
                  .substring(0, 150);
                
                return (
                  <Link
                    key={page.id}
                    href={`/pages/${page.slug}`}
                    className="group block p-6 bg-white border border-gray-200 rounded-lg hover:border-[#00205B] hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <FileText className="w-6 h-6 text-[#00205B] group-hover:text-[#F6A800] transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-semibold text-[#00205B] group-hover:text-[#F6A800] transition-colors mb-2">
                          {page.title}
                        </h2>
                        {preview && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {preview}
                            {page.content.length > 150 ? '...' : ''}
                          </p>
                        )}
                        <span className="inline-flex items-center text-sm text-[#00205B] font-medium group-hover:text-[#F6A800] transition-colors">
                          Читать далее
                          <svg
                            className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

