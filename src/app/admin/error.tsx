'use client';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-6 rounded-xl border bg-white">
      <h2 className="text-lg font-semibold text-red-600">Ошибка в админ-панели</h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      {error.digest && <p className="text-gray-400 mt-1">Код: {error.digest}</p>}
      <button onClick={reset} className="mt-4 px-4 py-2 rounded-lg bg-[#00205B] text-white">Перезагрузить</button>
    </div>
  );
}


