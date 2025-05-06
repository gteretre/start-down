import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { GET } from '@/app/api/comments/route';
import { getCommentsByStartupId } from '@/lib/queries';
import clientPromise from '@/lib/mongodb';

jest.mock('@/lib/queries');
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: Promise.resolve({ close: jest.fn() }),
}));

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

function createRequest(url: string) {
  return { url } as unknown as Request;
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
    (getCommentsByStartupId as jest.Mock).mockResolvedValue([
      { _id: '1', text: 'A', userUpvotes: [1, 2] },
      { _id: '2', text: 'B', userUpvotes: [] },
    ]);
    const req = createRequest('http://localhost/api/comments?startupId=abc&page=1&limit=1');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.comments.length).toBe(1);
    expect(data.hasMore).toBe(true);
    expect(data.comments[0].text).toBe('A');
    expect(Array.isArray(data.comments[0].userUpvotes)).toBe(true);
  });
});

afterAll(async () => {
  const client = await clientPromise;
  await client.close();
});
