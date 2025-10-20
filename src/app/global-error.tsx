'use client';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body>
        <div style={{ padding: 24 }}>
          <h1 style={{ fontWeight: 700, color: '#b91c1c' }}>Произошла ошибка</h1>
          <p style={{ marginTop: 8 }}>Пожалуйста, перезагрузите страницу или попробуйте позже.</p>
          {error?.digest && (
            <p style={{ marginTop: 8, color: '#6b7280' }}>Код: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}


