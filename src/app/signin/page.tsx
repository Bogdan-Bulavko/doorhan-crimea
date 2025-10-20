'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', { redirect: false, email, password });
    setLoading(false);
    if (res?.ok) {
      router.replace('/admin');
    } else {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[#00205B]">Вход в админ‑панель</h1>
        <div className="mt-4">
          <label className="block text-sm text-gray-600">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
        <div className="mt-3">
          <label className="block text-sm text-gray-600">Пароль</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        <button disabled={loading} type="submit" className="mt-5 w-full rounded-lg bg-[#00205B] text-white py-2">
          {loading ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}


