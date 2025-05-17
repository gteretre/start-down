import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { GET } from '@/app/api/comments/route';
import { DELETE } from '@/app/api/comments/[id]/route';
import * as authModule from '@/lib/auth';
import * as dbModule from '@/lib/mongodb';
import { getCommentsByStartupId } from '@/lib/queries';
import clientPromise from '@/lib/mongodb';
import { NextRequest } from 'next/server';

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

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(() => {
  jest.spyOn(authModule, 'auth').mockResolvedValue({ user: { username: 'test' } });
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
        { _id: '1', text: 'A', userUpvotes: [1, 2] },
        { _id: '2', text: 'B', userUpvotes: [] },
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

afterAll(async () => {
  const client = await clientPromise;
  await client.close();
});
