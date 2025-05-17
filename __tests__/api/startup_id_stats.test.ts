import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

jest.mock('@/api-middleware/rateLimits', () => ({
  __esModule: true,
  rateLimit: jest.fn(() => ({ limited: false })),
}));

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/startup/[id]/stats/route';
import { getStartupStats } from '@/lib/queries';
import { updateStartupViews } from '@/lib/mutations';
import clientPromise from '@/lib/mongodb';
import * as actions from '@/lib/actions';
import * as authModule from '@/lib/auth';

jest.mock('@/lib/queries');
jest.mock('@/lib/mutations');
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: Promise.resolve({ close: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(authModule, 'auth').mockResolvedValue({ user: { username: 'testuser' } });
  jest.doMock('@/api-middleware/rateLimits', () => ({
    __esModule: true,
    rateLimit: jest.fn(() => ({ limited: false })),
  }));
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('/api/startup/[id]/stats API', () => {
  it('GET returns 400 for missing id', async () => {
    const req = new NextRequest('http://localhost/api/startup/');
    const res = await GET(req, { params: { id: '' } }); // pass empty string instead of undefined
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid id/);
  });

  it('GET returns views and likes for valid id', async () => {
    (getStartupStats as jest.Mock).mockResolvedValue({ views: 42, likes: 7 });
    const req = new NextRequest('http://localhost/api/startup/abc');
    const res = await GET(req, { params: { id: 'abc' } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.views).toBe(42);
    expect(data.likes).toBe(7);
  });

  it('POST updates and returns views and likes for valid id', async () => {
    (updateStartupViews as jest.Mock).mockResolvedValue(undefined);
    (getStartupStats as jest.Mock).mockResolvedValue({ views: 99, likes: 12 });
    jest.spyOn(actions, 'hasViewedInWindow').mockResolvedValueOnce(false);
    const req = new NextRequest('http://localhost/api/startup/abc', { method: 'POST' });
    const res = await POST(req, { params: { id: 'abc' } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.views).toBe(99);
    expect(data.likes).toBe(12);
  });

  it('POST returns 401 if not signed in', async () => {
    jest.spyOn(authModule, 'auth').mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost/api/startup/abc', { method: 'POST' });
    const res = await POST(req, { params: { id: 'abc' } });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toMatch(/You must be signed in/);
  });

  it('POST returns 404 if user not found', async () => {
    (updateStartupViews as jest.Mock).mockResolvedValue(undefined);
    (getStartupStats as jest.Mock).mockResolvedValue({ views: 99, likes: 12 });
    jest.spyOn(actions, 'hasViewedInWindow').mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost/api/startup/abc', { method: 'POST' });
    const res = await POST(req, { params: { id: 'abc' } });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toMatch(/User not found/);
  });

  it('POST returns 429 if already viewed', async () => {
    (updateStartupViews as jest.Mock).mockResolvedValue(undefined);
    (getStartupStats as jest.Mock).mockResolvedValue({ views: 99, likes: 12 });
    jest.spyOn(actions, 'hasViewedInWindow').mockResolvedValueOnce(true);
    const req = new NextRequest('http://localhost/api/startup/abc', { method: 'POST' });
    const res = await POST(req, { params: { id: 'abc' } });
    expect(res.status).toBe(429);
    const data = await res.json();
    // Accept either error message for robustness
    expect(data.error).toMatch(/View already counted|Too many requests/);
  });

  it('GET returns 500 on error', async () => {
    (getStartupStats as jest.Mock).mockRejectedValue(new Error('fail'));
    const req = new NextRequest('http://localhost/api/startup/error-id');
    const res = await GET(req, { params: { id: 'error-id' } });
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/Failed to fetch stats/);
  });

  it('POST returns 500 on error', async () => {
    jest.spyOn(actions, 'hasViewedInWindow').mockResolvedValueOnce(false);
    (updateStartupViews as jest.Mock).mockRejectedValue(new Error('fail'));
    const req = new NextRequest('http://localhost/api/startup/error-id-2', { method: 'POST' });
    const res = await POST(req, { params: { id: 'error-id-2' } });
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/Failed to update stats/);
  });
});

afterAll(async () => {
  jest.restoreAllMocks();
  const client = await clientPromise;
  await client.close();
});
