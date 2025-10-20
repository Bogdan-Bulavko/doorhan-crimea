'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const body = {
      name,
      slug,
      description: description || undefined,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
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
          <label className="block text-sm text-gray-600">SEO Title</label>
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">SEO Description</label>
          <textarea className="mt-1 w-full border rounded-lg px-3 py-2" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 border rounded-lg" onClick={() => router.push('/admin/categories')}>Назад</button>
        <button className="px-4 py-2 bg-[#00205B] text-white rounded-lg" onClick={submit}>Сохранить</button>
      </div>
    </div>
  );
}


