import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import SimpleMarkdownRenderer from '@/components/SimpleMarkdownRenderer';
import BreadCrumbs from '@/components/BreadCrumbs';
import { generateCanonical } from '@/lib/canonical-utils';
import { getRegionFromHeaders } from '@/lib/metadata-generator';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const headersList = await headers();
  const region = getRegionFromHeaders(headersList);

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

  const baseTitle = page.seoTitle?.trim() || page.title;
  const description = page.seoDescription?.trim() || page.content.substring(0, 160);
  const robots = page.robotsMeta?.trim() || 'index, follow';
  const canonicalUrl = generateCanonical('page', region, {
    pageSlug: slug,
    customCanonical: page.canonicalUrl,
    useFullUrl: true,
    forceMainDomain: true,
  });
  const fullTitle = `${baseTitle} | DoorHan Крым`;

  return {
    title: fullTitle,
    description,
    robots,
    keywords: `${page.title}, DoorHan, Крым`,
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: 'DoorHan Крым',
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
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
          {page.schemaMarkup && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: page.schemaMarkup }}
            />
          )}
        </article>
      </div>
    </main>
  );
}

