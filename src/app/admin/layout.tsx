export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LogoutButton from './_components/LogoutButton';
import { ProgressBar } from './_components/ProgressBar';
import { Preloader } from './_components/Preloader';
import { AlertProvider } from '@/contexts/AlertContext';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions as NextAuthOptions);
  const role = (session as unknown as { role?: string } | null)?.role;
  if (!session || role !== 'admin') {
    redirect('/signin');
  }

  return (
    <AlertProvider>
      <div className="min-h-screen grid grid-rows-[auto,1fr]">
        <ProgressBar />
        <Preloader />
        <header className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="font-bold text-[#00205B]">DoorHan Admin</Link>
              <div className="hidden md:flex items-center gap-4 text-sm">
                <Link href="/admin/users" className="hover:text-[#00205B] transition-colors">Пользователи</Link>
                <Link href="/admin/categories" className="hover:text-[#00205B] transition-colors">Категории</Link>
                <Link href="/admin/products" className="hover:text-[#00205B] transition-colors">Товары</Link>
                <Link href="/admin/regions" className="hover:text-[#00205B] transition-colors">Регионы</Link>
                <Link href="/admin/orders" className="hover:text-[#00205B] transition-colors">Заказы</Link>
                <Link href="/admin/forms" className="hover:text-[#00205B] transition-colors">Формы</Link>
                <Link href="/admin/settings" className="hover:text-[#00205B] transition-colors">Настройки</Link>
                <Link href="/admin/stats" className="hover:text-[#00205B] transition-colors">Статистика</Link>
                <LogoutButton />
              </div>
              <div className="md:hidden">
                <LogoutButton />
              </div>
            </div>
            <nav className="md:hidden mt-3 flex flex-wrap gap-2 text-sm">
              <Link href="/admin/users" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors">Пользователи</Link>
              <Link href="/admin/categories" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors">Категории</Link>
              <Link href="/admin/products" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors">Товары</Link>
              <Link href="/admin/regions" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors">Регионы</Link>
              <Link href="/admin/orders" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors">Заказы</Link>
              <Link href="/admin/forms" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors">Формы</Link>
              <Link href="/admin/settings" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors">Настройки</Link>
              <Link href="/admin/stats" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors">Статистика</Link>
            </nav>
          </div>
        </header>
        <main className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
        </main>
      </div>
    </AlertProvider>
  );
}


