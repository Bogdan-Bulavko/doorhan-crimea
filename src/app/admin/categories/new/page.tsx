'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ShortcodesInfo from '../../_components/ShortcodesInfo';
import RegionsList from '../../_components/RegionsList';

export default function NewCategoryPage() {
  const router = useRouter();
  
  // Загружаем список категорий для выбора родительской
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        const j = await res.json();
        if (j.success && j.data) {
          setCategories(j.data);
        }
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
      }
    };
    loadCategories();
  }, []);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [h1, setH1] = useState('');
  const [robotsMeta, setRobotsMeta] = useState('index, follow');
  const [schemaMarkup, setSchemaMarkup] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [contentTop, setContentTop] = useState('');
  const [contentBottom, setContentBottom] = useState('');
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string; parentId: number | null }>>([]);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const body = {
      name,
      slug,
      description: description || undefined,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      canonicalUrl: canonicalUrl || undefined,
      h1: h1 || undefined,
      robotsMeta: robotsMeta || 'index, follow',
      schemaMarkup: schemaMarkup || undefined,
      parentId: parentId || null,
      imageUrl: imageUrl || undefined,
      contentTop: contentTop || null,
      contentBottom: contentBottom || null,
    };
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    if (j.success) router.replace('/admin/categories');
    else setError(j.message || 'Ошибка сохранения');
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-[#00205B]">Добавить категорию</h1>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="rounded-xl border bg-white p-4 grid gap-3">
        <RegionsList defaultCollapsed={true} />
        <ShortcodesInfo context="category" />
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
          <label className="block text-sm text-gray-600">Родительская категория (для создания подкатегории)</label>
          <select 
            className="mt-1 w-full border rounded-lg px-3 py-2" 
            value={parentId || ''} 
            onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Нет (основная категория)</option>
            {categories
              .filter(c => c.id !== parentId) // Исключаем текущую категорию (если редактируем)
              .map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.slug})
                </option>
              ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Выберите родительскую категорию для создания подкатегории</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600">H1 Заголовок (если не указан, используется название)</label>
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={h1} onChange={(e) => setH1(e.target.value)} placeholder={name} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600">SEO Title</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [city], [category_name], [site_name] и др.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">SEO Description</label>
            <textarea className="mt-1 w-full border rounded-lg px-3 py-2" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [city], [category_name], [site_name] и др.</p>
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
        <div>
          <label className="block text-sm text-gray-600">Изображение категории</label>
          <div className="mt-1">
            <input
              type="text"
              placeholder="URL изображения"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
            {imageUrl && (
              <div className="mt-2">
                <Image
                  src={imageUrl}
                  alt="Предварительный просмотр"
                  width={128}
                  height={128}
                  className="object-cover rounded-lg border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Контент сверху страницы (HTML)</label>
          <textarea 
            className="mt-1 w-full border rounded-lg px-3 py-2 font-mono text-sm" 
            value={contentTop} 
            onChange={(e) => setContentTop(e.target.value)} 
            rows={8}
            placeholder='<p>Дополнительный контент, который будет отображаться вверху страницы категории</p>'
          />
          <p className="mt-1 text-xs text-gray-500">HTML контент для отображения вверху страницы категории (опционально)</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Контент снизу страницы (HTML)</label>
          <textarea 
            className="mt-1 w-full border rounded-lg px-3 py-2 font-mono text-sm" 
            value={contentBottom} 
            onChange={(e) => setContentBottom(e.target.value)} 
            rows={8}
            placeholder='<p>Дополнительный контент, который будет отображаться внизу страницы категории</p>'
          />
          <p className="mt-1 text-xs text-gray-500">HTML контент для отображения внизу страницы категории (опционально)</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 border rounded-lg" onClick={() => router.push('/admin/categories')}>Назад</button>
        <button className="px-4 py-2 bg-[#00205B] text-white rounded-lg" onClick={submit}>Сохранить</button>
      </div>
    </div>
  );
}


