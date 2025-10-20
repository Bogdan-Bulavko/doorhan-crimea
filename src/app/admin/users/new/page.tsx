'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { LoadingButton } from '../_components/ProgressBar';
import { LoadingOverlay } from '../_components/LoadingStates';

export default function NewUserPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'admin' | 'manager'>('customer');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setError(null);
    setIsSubmitting(true);
    
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName, phone: phone || undefined, role, isActive }),
        });
        const j = await res.json();
        if (j.success) {
          router.replace('/admin/users');
        } else {
          setError(j.message || 'Ошибка сохранения');
        }
      } catch {
        setError('Ошибка сети');
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <LoadingOverlay isLoading={isSubmitting}>
      <div className="grid gap-6">
        <h1 className="text-2xl font-bold text-[#00205B]">Добавить пользователя</h1>
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
        <div className="rounded-xl border bg-white p-6 grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <input 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                value={role}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === 'customer' || v === 'admin' || v === 'manager') setRole(v);
                }}
              >
                <option value="customer">Покупатель</option>
                <option value="admin">Администратор</option>
                <option value="manager">Менеджер</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-[#00205B] focus:ring-[#00205B]"
                /> 
                Активен
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" 
            onClick={() => router.push('/admin/users')}
            disabled={isSubmitting}
          >
            Назад
          </button>
          <LoadingButton
            isLoading={isSubmitting}
            className="px-4 py-2 bg-[#00205B] text-white rounded-lg hover:bg-[#001a4a] transition-colors"
            onClick={submit}
          >
            Сохранить
          </LoadingButton>
        </div>
      </div>
    </LoadingOverlay>
  );
}


