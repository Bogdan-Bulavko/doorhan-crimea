import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Список всех поддерживаемых регионов
const SUPPORTED_REGIONS = [
  'simferopol',
  'kerch',
  'evpatoria',
  'yalta',
  'feodosia',
  'sevastopol',
  'alushta',
  'dzhankoy',
  'bakhchisaray',
  'krasnoperekopsk',
  'saki',
  'armyansk',
  'sudak',
  'belogorsk',
  'inkerman',
  'balaklava',
  'shchelkino',
  'stary-krym',
  'alupka',
  'gurzuf',
  'simeiz',
  'foros',
  'koktebel',
  'livadia',
  'massandra',
  'nikita',
  'gaspra',
  'miskhor',
  'partenit',
  'kacha',
];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  const subdomain = host.split('.')[0];

  // Проверяем, является ли поддомен одним из поддерживаемых регионов
  const region = SUPPORTED_REGIONS.includes(subdomain) ? subdomain : 'default';

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
