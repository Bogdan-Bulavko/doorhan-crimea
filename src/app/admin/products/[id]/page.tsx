'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductSpecifications from '../../_components/ProductSpecifications';
import ImageUpload from '../../_components/ImageUpload';
import ShortcodesInfo from '../../_components/ShortcodesInfo';
import RegionsList from '../../_components/RegionsList';

type Category = { id: number; name: string };

interface Specification {
  id?: number;
  name: string;
  value: string;
  unit?: string;
  sortOrder: number;
}

interface ImageData {
  id: string;
  fileName: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  originalName: string;
  isMain?: boolean;
  sortOrder: number;
  altText?: string;
}

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
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [h1, setH1] = useState('');
  const [robotsMeta, setRobotsMeta] = useState('index, follow');
  const [schemaMarkup, setSchemaMarkup] = useState('');
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);

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
            title?: string; description?: string; shortDescription?: string; seoTitle?: string; seoDescription?: string; canonicalUrl?: string; h1?: string; robotsMeta?: string; schemaMarkup?: string;
            specifications?: Specification[];
            images?: Array<{ id: string; url: string; fileName: string; isMain: boolean; altText?: string; sortOrder?: number }>;
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
          setCanonicalUrl(p.canonicalUrl ?? '');
          setH1(p.h1 ?? '');
          setRobotsMeta(p.robotsMeta ?? 'index, follow');
          setSchemaMarkup(p.schemaMarkup ?? '');
          setSpecifications(p.specifications || []);
          
          // Преобразуем изображения из базы данных в формат компонента
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formattedImages: ImageData[] = (p.images || []).map((img: any, index: number) => ({
            id: `img_${img.id || index}`,
            fileName: (img.imageUrl || img.url)?.split('/').pop() || `image_${index}`,
            url: img.imageUrl || img.url || '',
            type: (img.imageUrl || img.url)?.includes('video') ? 'video' : 'image',
            size: 0, // Размер не сохраняется в БД
            originalName: img.altText || `Image ${index + 1}`,
            isMain: img.isMain || false,
            sortOrder: img.sortOrder || index,
            altText: img.altText || '',
          }));
          setImages(formattedImages);
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
      canonicalUrl: canonicalUrl || undefined,
      h1: h1 || undefined,
      robotsMeta: robotsMeta || undefined,
      schemaMarkup: schemaMarkup || undefined,
      specifications: specifications.filter(spec => spec.name.trim() && spec.value.trim()),
      images: images,
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
        <RegionsList />
        <ShortcodesInfo context="product" />
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
          <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [product_name], [product_price_from], [city] и др.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание товара
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#F6A800] focus:border-transparent disabled:bg-gray-100"
            placeholder="Введите подробное описание товара с поддержкой Markdown и HTML..."
          />
          <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [product_name], [product_price_from], [city], [phone_formatted] и др.</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600">H1 Заголовок (если не указан, используется название)</label>
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={h1} onChange={(e) => setH1(e.target.value)} placeholder={title || name} />
          <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [product_name], [city], [site_name] и др.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600">SEO Title</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [product_name], [city], [site_name] и др.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">SEO Description</label>
            <textarea className="mt-1 w-full border rounded-lg px-3 py-2" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">Можно использовать шорткоды: [product_name], [city], [phone_formatted] и др.</p>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Canonical URL (если не указан, генерируется автоматически)</label>
          <input 
            className="mt-1 w-full border rounded-lg px-3 py-2" 
            value={canonicalUrl} 
            onChange={(e) => setCanonicalUrl(e.target.value)} 
            placeholder="Авто: https://doorhan-crimea.ru/[category-slug]/[product-slug]"
          />
          <p className="mt-1 text-xs text-gray-500">Можно указать относительный (/category/product) или полный URL (https://example.com/product)</p>
        </div>
      </div>
      
      <div className="rounded-xl border bg-white p-6">
        <ImageUpload
          images={images}
          onChange={setImages}
          maxImages={10}
        />
      </div>
      
      <div className="rounded-xl border bg-white p-6">
        <ProductSpecifications
          specifications={specifications}
          onChange={setSpecifications}
        />
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 border rounded-lg" onClick={() => router.push('/admin/products')}>Назад</button>
        <button className="px-4 py-2 bg-[#00205B] text-white rounded-lg" onClick={save}>Сохранить</button>
      </div>
    </div>
  );
}


