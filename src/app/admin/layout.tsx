export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProgressBar } from './_components/ProgressBar';
import { Preloader } from './_components/Preloader';
import { AlertProvider } from '@/contexts/AlertContext';
import Sidebar from './_components/Sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions as NextAuthOptions);
  const role = (session as unknown as { role?: string } | null)?.role;
  if (!session || role !== 'admin') {
    redirect('/signin');
  }

  return (
    <AlertProvider>
      <div className="min-h-screen flex">
        <ProgressBar />
        <Preloader />
        <Sidebar />
        <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </AlertProvider>
  );
}


