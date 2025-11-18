'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [h1, setH1] = useState('');
  const [imageUrl, setImageUrl] = useState('');
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
      imageUrl: imageUrl || undefined,
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
        <div>
          <label className="block text-sm text-gray-600">SEO Title</label>
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">SEO Description</label>
          <textarea className="mt-1 w-full border rounded-lg px-3 py-2" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
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
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 border rounded-lg" onClick={() => router.push('/admin/categories')}>Назад</button>
        <button className="px-4 py-2 bg-[#00205B] text-white rounded-lg" onClick={submit}>Сохранить</button>
      </div>
    </div>
  );
}


