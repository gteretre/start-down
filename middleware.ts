import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CSP_DOMAINS } from '@/lib/cspDomains';

const isDev = process.env.NODE_ENV !== 'production';

function joinCsp(arr: string[]) {
  return arr.join(' ');
}

function mergeCspSources(directive: keyof typeof CSP_DOMAINS.google) {
  return Object.values(CSP_DOMAINS).flatMap((provider) => provider[directive] || []);
}

const scriptSrc = mergeCspSources('script');
const styleSrc = mergeCspSources('style');
const imgSrc = mergeCspSources('img');
const fontSrc = mergeCspSources('font');
const frameSrc = mergeCspSources('frame');
const connectSrc = mergeCspSources('connect');

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]']);

const getLocalConnectSources = (hostname: string | undefined) => {
  if (!hostname || !LOCAL_HOSTS.has(hostname.toLowerCase())) return [] as string[];
  // Omitting ports allows any port for the scheme. Include both http(s) and ws(s) variants.
  return [`http://${hostname}`, `https://${hostname}`, `ws://${hostname}`, `wss://${hostname}`];
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const requestHostname = request.nextUrl.hostname;
  const localConnectSources = getLocalConnectSources(requestHostname);

  // In development be permissive for local testing (allow websockets, blob/data, localhost origins).
  // In production remain stricter but still permit localhost when hosting there.
  const devConnectSources = Array.from(
    new Set([...connectSrc, ...localConnectSources, 'blob:', 'data:', 'ws:', 'wss:'])
  );
  const prodConnectSources = Array.from(new Set([...connectSrc, ...localConnectSources]));

  const securityHeaders = {
    'Content-Security-Policy': isDev
      ? `default-src 'self' data: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' ${joinCsp(scriptSrc)}; style-src 'self' 'unsafe-inline' ${joinCsp(styleSrc)}; img-src 'self' data: ${joinCsp(imgSrc)}; font-src 'self' ${joinCsp(fontSrc)}; frame-src 'self' ${joinCsp(frameSrc)}; connect-src 'self' ${joinCsp(devConnectSources)};`
      : `default-src 'self'; script-src 'self' 'unsafe-inline' ${joinCsp(scriptSrc)}; style-src 'self' 'unsafe-inline' ${joinCsp(styleSrc)}; img-src 'self' data: ${joinCsp(imgSrc)}; font-src 'self' ${joinCsp(fontSrc)}; frame-src 'self' ${joinCsp(frameSrc)}; connect-src 'self' ${joinCsp(prodConnectSources)};`,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'origin-when-cross-origin',
  } as const;

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: ['/((?!_next).*)'], // Apply to all routes except Next.js internals
};
