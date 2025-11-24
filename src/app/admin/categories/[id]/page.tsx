'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = useMemo(() => {
    const raw = params?.id;
    return typeof raw === 'string' ? Number(raw) : Number(Array.isArray(raw) ? raw[0] : NaN);
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [h1, setH1] = useState('');
  const [robotsMeta, setRobotsMeta] = useState('index, follow');
  const [schemaMarkup, setSchemaMarkup] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/categories/${categoryId}`);
        const j = await res.json();
        if (j.success && j.data) {
          const c = j.data as {
            name: string; slug: string; description?: string; seoTitle?: string; seoDescription?: string; canonicalUrl?: string; h1?: string; robotsMeta?: string; schemaMarkup?: string; isActive: boolean;
          };
          setName(c.name);
          setSlug(c.slug);
          setDescription(c.description ?? '');
          setSeoTitle(c.seoTitle ?? '');
          setSeoDescription(c.seoDescription ?? '');
          setCanonicalUrl(c.canonicalUrl ?? '');
          setH1(c.h1 ?? '');
          setRobotsMeta(c.robotsMeta ?? 'index, follow');
          setSchemaMarkup(c.schemaMarkup ?? '');
          setIsActive(Boolean(c.isActive));
        } else {
          setError('Категория не найдена');
        }
      } catch {
        setError('Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    if (!Number.isNaN(categoryId)) load();
  }, [categoryId]);

  const save = async () => {
    setError(null);
    const body = {
      name,
      slug,
      description: description || undefined,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      canonicalUrl: canonicalUrl || undefined,
      h1: h1 || undefined,
      robotsMeta: robotsMeta || undefined,
      schemaMarkup: schemaMarkup || undefined,
      isActive,
    };
    const res = await fetch(`/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    if (j.success) router.replace('/admin/categories');
    else setError(j.message || 'Ошибка сохранения');
  };

  if (loading) return <div className="p-6">Загрузка…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-[#00205B]">Редактировать категорию #{categoryId}</h1>
      <div className="rounded-xl border bg-white p-4 grid gap-3">
        <div>
          <label className="block text-sm text-gray-600">Название</label>
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Slug</label>
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Описание</label>
          <textarea className="mt-1 w-full border rounded-lg px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">H1 Заголовок (если не указан, используется название)</label>
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={h1} onChange={(e) => setH1(e.target.value)} placeholder={name} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600">SEO Title</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600">SEO Description</label>
            <textarea className="mt-1 w-full border rounded-lg px-3 py-2" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Canonical URL (если не указан, генерируется автоматически)</label>
          <input 
            className="mt-1 w-full border rounded-lg px-3 py-2" 
            value={canonicalUrl} 
            onChange={(e) => setCanonicalUrl(e.target.value)} 
            placeholder={`Авто: https://doorhan-crimea.ru/${slug}`}
          />
          <p className="mt-1 text-xs text-gray-500">Можно указать относительный (/category) или полный URL (https://example.com/category)</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Robots Meta</label>
          <select 
            className="mt-1 w-full border rounded-lg px-3 py-2" 
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
          <label className="block text-sm text-gray-600">Schema Markup (JSON-LD)</label>
          <textarea 
            className="mt-1 w-full border rounded-lg px-3 py-2 font-mono text-xs" 
            value={schemaMarkup} 
            onChange={(e) => setSchemaMarkup(e.target.value)} 
            rows={6}
            placeholder='{"@context": "https://schema.org", "@type": "Product", ...}'
          />
          <p className="mt-1 text-xs text-gray-500">JSON-LD разметка для структурированных данных (опционально)</p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Активна
        </label>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 border rounded-lg" onClick={() => router.push('/admin/categories')}>Назад</button>
        <button className="px-4 py-2 bg-[#00205B] text-white rounded-lg" onClick={save}>Сохранить</button>
      </div>
    </div>
  );
}


