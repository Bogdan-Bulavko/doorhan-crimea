'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ShortcodesInfo from '../../_components/ShortcodesInfo';
import RegionsList from '../../_components/RegionsList';

export default function NewPagePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [h1, setH1] = useState('');
  const [robotsMeta, setRobotsMeta] = useState('index, follow');
  const [schemaMarkup, setSchemaMarkup] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const body = {
        title,
        slug,
        content,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        canonicalUrl: canonicalUrl || undefined,
        h1: h1 || undefined,
        robotsMeta: robotsMeta || 'index, follow',
        schemaMarkup: schemaMarkup || undefined,
        isActive,
        sortOrder: Number(sortOrder) || 0,
      };

      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const j = await res.json();
      if (j.success) {
        router.replace('/admin/pages');
      } else {
        setError(j.message || 'Ошибка сохранения');
      }
    } catch (err) {
      setError('Ошибка при сохранении страницы');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Автоматическая генерация slug из title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === title.toLowerCase().replace(/[^a-zа-я0-9]+/g, '-')) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-zа-я0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(autoSlug);
    }
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-[#00205B]">Добавить страницу</h1>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
      <div className="rounded-xl border bg-white p-4 grid gap-4">
        <RegionsList defaultCollapsed={true} />
        <ShortcodesInfo context="page" />
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Название <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Название страницы"
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
            placeholder="url-slug"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL страницы будет: /pages/{slug}
          </p>
        </div>
        <ShortcodesInfo context="page" />
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Содержимое <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[300px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Содержимое страницы (можно использовать Markdown и шорткоды)"
          />
          <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [city], [phone_formatted], [site_name] и др. См. блок выше.</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">H1 Заголовок (если не указан, используется название)</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={h1}
            onChange={(e) => setH1(e.target.value)}
            placeholder={title}
          />
          <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [city], [site_name] и др.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">SEO Title</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Мета-заголовок для SEO"
            />
            <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [city], [site_name] и др.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              SEO Description
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Мета-описание для SEO"
            />
            <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [city], [phone_formatted] и др.</p>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Canonical URL (если не указан, генерируется автоматически)</label>
          <input 
            className="w-full border rounded-lg px-3 py-2" 
            value={canonicalUrl} 
            onChange={(e) => setCanonicalUrl(e.target.value)} 
            placeholder={`Авто: https://zavod-doorhan.ru/pages/${slug}`}
          />
          <p className="mt-1 text-xs text-gray-500">Можно указать относительный (/pages/slug) или полный URL (https://example.com/page)</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Robots Meta</label>
          <select 
            className="w-full border rounded-lg px-3 py-2" 
            value={robotsMeta} 
            onChange={(e) => setRobotsMeta(e.target.value)}
          >
            <option value="index, follow">index, follow</option>
            <option value="noindex, follow">noindex, follow</option>
            <option value="index, nofollow">index, nofollow</option>
            <option value="noindex, nofollow">noindex, nofollow</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">Управление индексацией страницы поисковыми системами</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Schema Markup (JSON-LD)</label>
          <textarea 
            className="w-full border rounded-lg px-3 py-2 font-mono text-xs min-h-[150px]" 
            value={schemaMarkup} 
            onChange={(e) => setSchemaMarkup(e.target.value)} 
            placeholder='{"@context": "https://schema.org", "@type": "Article", ...}'
          />
          <p className="mt-1 text-xs text-gray-500">JSON-LD разметка для структурированных данных (опционально)</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
      <div className="flex gap-2">
        <button
          className="px-4 py-2 border rounded-lg"
          onClick={() => router.push('/admin/pages')}
          disabled={isSubmitting}
        >
          Назад
        </button>
        <button
          className="px-4 py-2 bg-[#00205B] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={submit}
          disabled={isSubmitting || !title || !slug || !content}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}

