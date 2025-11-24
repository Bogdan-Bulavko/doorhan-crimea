import { db } from '@/lib/db';
import ArticlesList from './ArticlesList';

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage() {
  const articles = await db.article.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return <ArticlesList initialArticles={articles} />;
}

