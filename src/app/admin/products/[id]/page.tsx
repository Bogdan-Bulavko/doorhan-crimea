'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Category = { id: number; name: string };

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = useMemo(() => {
    const raw = params?.id;
    return typeof raw === 'string' ? Number(raw) : Number(Array.isArray(raw) ? raw[0] : NaN);
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('RUB');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [catsRes, prodRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch(`/api/admin/products/${productId}`),
        ]);
        const catsJ = await catsRes.json();
        if (catsJ.success) setCategories(catsJ.data);

        const prodJ = await prodRes.json();
        if (prodJ.success && prodJ.data) {
          const p = prodJ.data as {
            name: string; slug: string; categoryId: number; price: number; currency: string;
            title?: string; description?: string; shortDescription?: string; seoTitle?: string; seoDescription?: string;
          };
          setName(p.name);
          setSlug(p.slug);
          setCategoryId(p.categoryId);
          setPrice(String(p.price));
          setCurrency(p.currency);
          setTitle(p.title ?? '');
          setDescription(p.description ?? '');
          setShortDescription(p.shortDescription ?? '');
          setSeoTitle(p.seoTitle ?? '');
          setSeoDescription(p.seoDescription ?? '');
        } else {
          setError('Товар не найден');
        }
      } catch {
        setError('Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    if (!Number.isNaN(productId)) load();
  }, [productId]);

  const save = async () => {
    setError(null);
    const body = {
      name,
      slug,
      categoryId: Number(categoryId),
      price: Number(price),
      currency,
      title: title || undefined,
      description: description || undefined,
      shortDescription: shortDescription || undefined,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
    };
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    if (j.success) router.replace('/admin/products');
    else setError(j.message || 'Ошибка сохранения');
  };

  if (loading) return <div className="p-6">Загрузка…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-[#00205B]">Редактировать товар #{productId}</h1>
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
          <label className="block text-sm text-gray-600">Категория</label>
          <select className="mt-1 w-full border rounded-lg px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600">Цена</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Валюта</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Краткое описание</label>
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Описание</label>
          <textarea className="mt-1 w-full border rounded-lg px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
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
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 border rounded-lg" onClick={() => router.push('/admin/products')}>Назад</button>
        <button className="px-4 py-2 bg-[#00205B] text-white rounded-lg" onClick={save}>Сохранить</button>
      </div>
    </div>
  );
}


