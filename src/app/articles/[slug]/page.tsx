import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';
import BreadCrumbs from '@/components/BreadCrumbs';
import Image from 'next/image';
import { Calendar, User, Tag } from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  const article = await db.article.findFirst({
    where: {
      slug,
      isActive: true,
    },
  });

  if (!article) {
    return {
      title: 'Статья не найдена | DoorHan Крым',
      description: 'Запрашиваемая статья не найдена',
    };
  }

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || article.content.substring(0, 160);
  const canonicalUrl = article.canonicalUrl || `https://zavod-doorhan.ru/articles/${slug}`;

  return {
    title: `${title} | DoorHan Крым`,
    description,
    keywords: article.tags || `${article.title}, DoorHan, Крым`,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'DoorHan Крым',
      locale: 'ru_RU',
      type: 'article',
      images: article.featuredImageUrl ? [
        {
          url: article.featuredImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ] : undefined,
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author ? [article.author] : undefined,
      tags: article.tags ? article.tags.split(',').map(t => t.trim()) : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.featuredImageUrl ? [article.featuredImageUrl] : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: article.robotsMeta || 'index, follow',
    other: article.schemaMarkup ? {
      'application/ld+json': article.schemaMarkup,
    } : undefined,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  const article = await db.article.findFirst({
    where: {
      slug,
      isActive: true,
    },
  });

  if (!article) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Статьи', href: '/articles' },
    { label: article.title, href: `/articles/${article.slug}` },
  ];

  const tags = article.tags 
    ? article.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BreadCrumbs items={breadcrumbs} />
        
        <article className="mt-8">
          {/* Заголовок */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-[#00205B] mb-4">
              {article.h1 || article.title}
            </h1>
            
            {/* Метаинформация */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              {article.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </div>
              )}
              {article.publishedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={article.publishedAt.toISOString()}>
                    {new Date(article.publishedAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              )}
            </div>

            {/* Теги */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#00205B] text-white rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Изображение */}
            {article.featuredImageUrl && (
              <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden mb-8">
                <Image
                  src={article.featuredImageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Краткое описание */}
            {article.excerpt && (
              <p className="text-xl text-gray-700 leading-relaxed mb-8 italic border-l-4 border-[#F6A800] pl-4">
                {article.excerpt}
              </p>
            )}
          </header>

          {/* Содержимое */}
          <div className="prose prose-lg max-w-none">
            <SimpleMarkdownRenderer content={article.content} />
          </div>

          {/* Schema Markup */}
          {article.schemaMarkup && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: article.schemaMarkup }}
            />
          )}
        </article>
      </div>
    </main>
  );
}

