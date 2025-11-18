import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';
import BreadCrumbs from '@/components/BreadCrumbs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const page = await db.page.findFirst({
    where: {
      slug,
      isActive: true,
    },
  });

  if (!page) {
    return {
      title: 'Страница не найдена | DoorHan Крым',
      description: 'Запрашиваемая страница не найдена',
    };
  }

  const title = page.seoTitle || page.title;
  const description = page.seoDescription || page.content.substring(0, 160);

  return {
    title: `${title} | DoorHan Крым`,
    description,
    keywords: `${page.title}, DoorHan, Крым`,
    openGraph: {
      title,
      description,
      url: `https://doorhan-crimea.ru/pages/${slug}`,
      siteName: 'DoorHan Крым',
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://doorhan-crimea.ru/pages/${slug}`,
    },
  };
}

export default async function PagePage({ params }: PageProps) {
  const { slug } = await params;

  const page = await db.page.findFirst({
    where: {
      slug,
      isActive: true,
    },
  });

  if (!page) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Страницы', href: '/pages' },
    { label: page.title, href: `/pages/${page.slug}` },
  ];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BreadCrumbs items={breadcrumbs} />
        <article className="mt-8">
          <h1 className="text-4xl font-bold text-[#00205B] mb-6">
            {page.title}
          </h1>
          <div className="prose prose-lg max-w-none">
            <SimpleMarkdownRenderer content={page.content} />
          </div>
        </article>
      </div>
    </main>
  );
}

