import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  const subdomain = host.split('.')[0];

  let region = 'default';

  if (subdomain === 'simferopol') region = 'simferopol';
  else if (subdomain === 'yalta') region = 'yalta';
  else if (subdomain === 'alushta') region = 'alushta';
  else if (subdomain === 'sevastopol') region = 'sevastopol';

  // Прокидываем регион во входящие заголовки запроса, чтобы headers() в app мог его прочитать
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-region', region);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Дополнительно дублируем в ответные заголовки (может быть полезно для отладки/CDN)
  response.headers.set('x-region', region);
  response.headers.set('x-pathname', request.nextUrl.pathname);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
