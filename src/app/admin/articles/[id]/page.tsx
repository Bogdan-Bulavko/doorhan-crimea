'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SingleImageUpload from '../../_components/SingleImageUpload';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = useMemo(() => {
    const raw = params?.id;
    return typeof raw === 'string' ? Number(raw) : Number(Array.isArray(raw) ? raw[0] : NaN);
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [h1, setH1] = useState('');
  const [robotsMeta, setRobotsMeta] = useState('index, follow');
  const [schemaMarkup, setSchemaMarkup] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [publishedAt, setPublishedAt] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/articles/${articleId}`);
        const j = await res.json();
        if (j.success && j.data) {
          const a = j.data as {
            title: string;
            slug: string;
            content: string;
            excerpt?: string;
            featuredImageUrl?: string;
            author?: string;
            tags?: string;
            seoTitle?: string;
            seoDescription?: string;
            canonicalUrl?: string;
            h1?: string;
            robotsMeta?: string;
            schemaMarkup?: string;
            isActive: boolean;
            sortOrder: number;
            publishedAt?: string | Date | null;
          };
          setTitle(a.title);
          setSlug(a.slug);
          setContent(a.content);
          setExcerpt(a.excerpt ?? '');
          setFeaturedImageUrl(a.featuredImageUrl ?? '');
          setAuthor(a.author ?? '');
          setTags(a.tags ?? '');
          setSeoTitle(a.seoTitle ?? '');
          setSeoDescription(a.seoDescription ?? '');
          setCanonicalUrl(a.canonicalUrl ?? '');
          setH1(a.h1 ?? '');
          setRobotsMeta(a.robotsMeta ?? 'index, follow');
          setSchemaMarkup(a.schemaMarkup ?? '');
          setIsActive(Boolean(a.isActive));
          setSortOrder(a.sortOrder ?? 0);
          if (a.publishedAt) {
            const date = typeof a.publishedAt === 'string' 
              ? new Date(a.publishedAt) 
              : a.publishedAt;
            setPublishedAt(date.toISOString().split('T')[0]);
          } else {
            setPublishedAt(new Date().toISOString().split('T')[0]);
          }
        } else {
          setError('Статья не найдена');
        }
      } catch {
        setError('Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    if (!Number.isNaN(articleId)) load();
  }, [articleId]);

  const save = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const body = {
        title,
        slug,
        content,
        excerpt: excerpt || undefined,
        featuredImageUrl: featuredImageUrl || undefined,
        author: author || undefined,
        tags: tags || undefined,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        canonicalUrl: canonicalUrl || undefined,
        h1: h1 || undefined,
        robotsMeta: robotsMeta || undefined,
        schemaMarkup: schemaMarkup || undefined,
        isActive,
        sortOrder: Number(sortOrder) || 0,
        publishedAt: publishedAt || undefined,
      };

      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const j = await res.json();
      if (j.success) {
        router.replace('/admin/articles');
      } else {
        setError(j.message || 'Ошибка сохранения');
      }
    } catch (err) {
      setError('Ошибка при сохранении статьи');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Загрузка…</div>;
  if (error && !title) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-[#00205B]">
        Редактировать статью #{articleId}
      </h1>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Основная информация */}
      <div className="rounded-xl border bg-white p-4 grid gap-4">
        <h2 className="text-lg font-semibold text-[#00205B] mb-2">Основная информация</h2>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Название статьи <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            URL статьи будет: /articles/{slug}
          </p>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Краткое описание (Excerpt)
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Содержимое статьи <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[400px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div>
          <SingleImageUpload
            value={featuredImageUrl}
            onChange={setFeaturedImageUrl}
            label="Изображение статьи"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Автор
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Теги (через запятую)
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Дата публикации
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Порядок сортировки
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            />
          </div>
        </div>
        <div className="flex items-center">
          <label className="inline-flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />{' '}
            Активна
          </label>
        </div>
      </div>

      {/* SEO настройки */}
      <div className="rounded-xl border bg-white p-4 grid gap-4">
        <h2 className="text-lg font-semibold text-[#00205B] mb-2">SEO настройки</h2>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            H1 Заголовок (если не указан, используется название)
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={h1}
            onChange={(e) => setH1(e.target.value)}
            placeholder={title || 'H1 заголовок'}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">SEO Title</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              SEO Description
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Canonical URL (если не указан, генерируется автоматически)
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            placeholder="Авто: https://doorhan-crimea.ru/articles/[slug]"
          />
          <p className="mt-1 text-xs text-gray-500">
            Можно указать относительный (/articles/slug) или полный URL
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Robots Meta
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={robotsMeta}
              onChange={(e) => setRobotsMeta(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Schema Markup (JSON-LD)
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 font-mono text-xs"
              value={schemaMarkup}
              onChange={(e) => setSchemaMarkup(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 border rounded-lg"
          onClick={() => router.push('/admin/articles')}
          disabled={isSubmitting}
        >
          Назад
        </button>
        <button
          className="px-4 py-2 bg-[#00205B] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={save}
          disabled={isSubmitting || !title || !slug || !content}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}

