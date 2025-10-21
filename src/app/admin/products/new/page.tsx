'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormValidation, FormField } from '../../_components/FormValidation';
import { z } from 'zod';

type Category = { id: number; name: string };

const productSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().min(1, 'Slug обязателен'),
  categoryId: z.number().min(1, 'Выберите категорию'),
  price: z.number().min(0, 'Цена должна быть положительной'),
  currency: z.string().min(1, 'Валюта обязательна'),
  title: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export default function NewProductPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { validate, getFieldError, clearErrors } =
    useFormValidation(productSchema);

  // form state
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
        const res = await fetch('/api/admin/categories');
        const j = await res.json();
        if (j.success) setCategories(j.data);
      } catch {
        setError('Не удалось загрузить категории');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const next = () => setStep((s) => Math.min(3, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    setError(null);
    clearErrors();

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

    const validation = validate(body);
    if (!validation.success) {
      setError('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    if (j.success) router.replace('/admin/products');
    else setError(j.message || 'Ошибка сохранения');
  };

  if (loading) return <div className="p-6">Загрузка…</div>;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold text-[#00205B]">Добавить товар</h1>
      {error && <div className="text-sm text-red-600">{error}</div>}

      {step === 1 && (
        <div className="rounded-xl border bg-white p-4 grid gap-3">
          <FormField label="Название" error={getFieldError('name')} required>
            <input
              className={`mt-1 w-full border rounded-lg px-3 py-2 ${
                getFieldError('name') ? 'border-red-500' : ''
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>
          <FormField label="Slug" error={getFieldError('slug')} required>
            <input
              className={`mt-1 w-full border rounded-lg px-3 py-2 ${
                getFieldError('slug') ? 'border-red-500' : ''
              }`}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </FormField>
          <FormField
            label="Категория"
            error={getFieldError('categoryId')}
            required
          >
            <select
              className={`mt-1 w-full border rounded-lg px-3 py-2 ${
                getFieldError('categoryId') ? 'border-red-500' : ''
              }`}
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-xl border bg-white p-4 grid gap-3">
          <div>
            <label className="block text-sm text-gray-600">Цена</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Валюта</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Заголовок</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">
              Краткое описание
            </label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Описание</label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-xl border bg-white p-4 grid gap-3">
          <div>
            <label className="block text-sm text-gray-600">SEO Title</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">
              SEO Description
            </label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          className="px-4 py-2 border rounded-lg"
          onClick={() => router.push('/admin/products')}
        >
          Отмена
        </button>
        <button
          className="px-4 py-2 border rounded-lg"
          onClick={prev}
          disabled={step === 1}
        >
          Назад
        </button>
        {step < 3 ? (
          <button
            className="px-4 py-2 bg-[#00205B] text-white rounded-lg"
            onClick={next}
          >
            Далее
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-[#00205B] text-white rounded-lg"
            onClick={submit}
          >
            Сохранить
          </button>
        )}
      </div>
    </div>
  );
}
