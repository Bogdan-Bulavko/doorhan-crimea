import { db } from '@/lib/db';
import { Metadata } from 'next';
import Link from 'next/link';
import BreadCrumbs from '@/components/BreadCrumbs';
import { FileText, Calendar, User, Tag } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Статьи | DoorHan Крым',
  description: 'Полезные статьи о воротах, автоматике, установке и обслуживании от DoorHan Крым. Экспертные советы и рекомендации.',
  keywords: 'DoorHan Крым, статьи, ворота, автоматика, установка, обслуживание, советы',
  openGraph: {
    title: 'Статьи | DoorHan Крым',
    description: 'Полезные статьи о воротах и автоматике от DoorHan Крым',
    url: 'https://doorhan-crimea.ru/articles',
    siteName: 'DoorHan Крым',
    locale: 'ru_RU',
    type: 'website',
  },
  alternates: {
    canonical: 'https://doorhan-crimea.ru/articles',
  },
};

export default async function ArticlesListPage() {
  const articles = await db.article.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { sortOrder: 'asc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Статьи', href: '/articles' },
  ];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <BreadCrumbs items={breadcrumbs} />
        
        <div className="mt-8">
          <h1 className="text-4xl font-bold text-[#00205B] mb-2">
            Статьи
          </h1>
          <p className="text-gray-600 mb-8">
            Полезная информация о воротах, автоматике, установке и обслуживании
          </p>

          {articles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Статьи пока не добавлены</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => {
                const preview = article.excerpt || 
                  article.content
                    .replace(/[#*`]/g, '')
                    .replace(/\n/g, ' ')
                    .trim()
                    .substring(0, 150);
                
                const tags = article.tags 
                  ? article.tags.split(',').map(t => t.trim()).filter(Boolean)
                  : [];
                
                return (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#00205B] hover:shadow-lg transition-all duration-200"
                  >
                    {article.featuredImageUrl && (
                      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                        <Image
                          src={article.featuredImageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-[#00205B] group-hover:text-[#F6A800] transition-colors mb-3 line-clamp-2">
                        {article.title}
                      </h2>
                      {preview && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {preview}
                          {!article.excerpt && article.content.length > 150 ? '...' : ''}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
                        {article.author && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{article.author}</span>
                          </div>
                        )}
                        {article.publishedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(article.publishedAt).toLocaleDateString('ru-RU', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
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

