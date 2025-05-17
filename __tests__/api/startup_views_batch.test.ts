import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { POST } from '@/app/api/startup/views/batch/route';
import clientPromise from '@/lib/mongodb';

function createRequest(body?: Record<string, unknown>) {
  return {
    headers: {
      get: (key: string) => {
        if (key.toLowerCase() === 'x-forwarded-for') return '127.0.0.1';
        return undefined;
      },
    },
    json: async () => body,
  } as unknown as Request;
}

describe('POST /api/startup/views/batch', () => {
  it('should return 400 if no ids are provided', async () => {
    const req = createRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid or empty IDs array');
  });

  it('should return 400 if ids is not an array', async () => {
    const req = createRequest({ ids: 'not-an-array' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid or empty IDs array');
  });
});

afterAll(async () => {
  const client = await clientPromise;
  await client.close();
});
