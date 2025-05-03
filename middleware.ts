import { NextResponse } from 'next/server';
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

const securityHeaders = {
  'Content-Security-Policy': isDev
    ? `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' ${joinCsp(scriptSrc)}; style-src 'self' 'unsafe-inline' ${joinCsp(styleSrc)}; img-src 'self' data: ${joinCsp(imgSrc)}; font-src 'self' ${joinCsp(fontSrc)}; frame-src 'self' ${joinCsp(frameSrc)}; connect-src 'self' ${joinCsp(connectSrc)};`
    : `default-src 'self'; script-src 'self' ${joinCsp(scriptSrc)}; style-src 'self' ${joinCsp(styleSrc)}; img-src 'self' data: ${joinCsp(imgSrc)}; font-src 'self' ${joinCsp(fontSrc)}; frame-src 'self' ${joinCsp(frameSrc)}; connect-src 'self' ${joinCsp(connectSrc)};`,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export async function middleware() {
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: ['/((?!_next).*)'], // Apply to all routes except Next.js internals
};
