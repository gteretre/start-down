import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { GET } from '@/app/api/comments/route';
import { DELETE } from '@/app/api/comments/[id]/route';
import * as authModule from '@/lib/auth';
import * as dbModule from '@/lib/mongodb';
import { getCommentsByStartupId } from '@/lib/queries';
import clientPromise from '@/lib/mongodb';
import { NextRequest } from 'next/server';
import { rateLimit } from '@/api-middleware/rateLimits';

jest.mock('@/lib/queries');
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: Promise.resolve({ close: jest.fn() }),
  getDb: jest.fn(),
}));
jest.mock('mongodb', () => ({
  ObjectId: function (id: string) {
    return id;
  },
}));
jest.mock('@/api-middleware/rateLimits', () => ({
  __esModule: true,
  rateLimit: jest.fn(() => ({ limited: false })),
}));

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(() => {
  jest.spyOn(authModule, 'auth').mockResolvedValue({ user: { username: 'test' } });
  (rateLimit as jest.Mock).mockReturnValue({ limited: false });
});

afterAll(() => {
  jest.restoreAllMocks();
});

function createRequest(url: string): Request {
  return new Request(url);
}

function createNextRequest(url: string): NextRequest {
  return new NextRequest(url);
}

describe('GET /api/comments', () => {
  it('should return 400 if startupId is missing', async () => {
    const req = createRequest('http://localhost/api/comments');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toContain('Missing startupId');
  });

  it('should return paginated comments for valid startupId', async () => {
    (getCommentsByStartupId as jest.Mock).mockResolvedValue({
      comments: [
        { _id: '1', text: 'A', userUpvotes: ['u1', 'u2'], startupId: 'abc' },
        { _id: '2', text: 'B', userUpvotes: [], startupId: 'abc' },
      ],
      hasMore: true,
    });
    const req = createRequest('http://localhost/api/comments?startupId=abc&page=1&limit=1');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.comments)).toBe(true);
    expect(typeof data.hasMore).toBe('boolean');
    expect(data.comments.length).toBeGreaterThan(0);
    expect(data.comments[0].text).toBe('A');
    expect(Array.isArray(data.comments[0].userUpvotes)).toBe(true);
    expect(data.comments[0].startupId).toBe('abc');
  });
});

describe('DELETE /api/comments/[id]', () => {
  it('should return 401 if not authenticated', async () => {
    jest.spyOn(authModule, 'auth').mockResolvedValueOnce(null);
    const req = createNextRequest('http://localhost/api/comments/1');
    const params = { id: '1' };
    const res = await DELETE(req, { params });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('signed in');
  });

  it('should return 404 if author not found', async () => {
    jest.spyOn(authModule, 'auth').mockResolvedValueOnce({ user: { username: 'test' } });
    (dbModule.getDb as jest.Mock).mockResolvedValueOnce({
      collection: () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }),
    });
    const req = createNextRequest('http://localhost/api/comments/1');
    const params = { id: '1' };
    const res = await DELETE(req, { params });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('profile');
  });

  it('should return 200 if comment deleted', async () => {
    jest.spyOn(authModule, 'auth').mockResolvedValueOnce({ user: { username: 'test' } });
    (dbModule.getDb as jest.Mock).mockResolvedValueOnce({
      collection: () => ({
        findOne: jest.fn().mockResolvedValue({ _id: 'authorid' }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      }),
    });
    const req = createNextRequest('http://localhost/api/comments/1');
    const params = { id: '1' };
    const res = await DELETE(req, { params });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('should return 403 if comment not deleted', async () => {
    jest.spyOn(authModule, 'auth').mockResolvedValueOnce({ user: { username: 'test' } });
    (dbModule.getDb as jest.Mock).mockResolvedValueOnce({
      collection: () => ({
        findOne: jest.fn().mockResolvedValue({ _id: 'authorid' }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      }),
    });
    const req = createNextRequest('http://localhost/api/comments/1');
    const params = { id: '1' };
    const res = await DELETE(req, { params });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Failed to delete comment');
  });
});

describe('POST /api/comments', () => {
  it('should return 401 if not authenticated', async () => {
    jest.spyOn(authModule, 'auth').mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startupId: '507f1f77bcf86cd799439011', text: 'Test comment' }),
    });
    const { POST } = await import('@/app/api/comments/route');
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('signed in');
  });
  // Add more POST tests as needed for success, missing fields, etc.
});

describe('POST /api/comments/[id] (upvote)', () => {
  it('should return 401 if not authenticated', async () => {
    jest.spyOn(authModule, 'auth').mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost/api/comments/507f1f77bcf86cd799439011/upvote', {
      method: 'POST',
    });
    const params = { id: '507f1f77bcf86cd799439011' };
    const { POST } = await import('@/app/api/comments/[id]/route');
    const res = await POST(req, { params });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('signed in');
  });
  // Add more upvote tests as needed for success, already upvoted, etc.
});

afterAll(async () => {
  const client = await clientPromise;
  await client.close();
});
