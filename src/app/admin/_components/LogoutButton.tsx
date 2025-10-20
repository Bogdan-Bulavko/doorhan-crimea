'use client';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-100"
      aria-label="Выйти"
    >
      Выход
    </button>
  );
}


