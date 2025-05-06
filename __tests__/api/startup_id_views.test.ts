import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createMocks } from 'node-mocks-http';

import handler from '@/pages/api/startup/[id]/views';
import { getStartupViews } from '@/lib/queries';
import { updateStartupViews } from '@/lib/mutations';
import clientPromise from '@/lib/mongodb';

jest.mock('@/lib/queries');
jest.mock('@/lib/mutations');
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: Promise.resolve({ close: jest.fn() }),
}));

describe('/api/startup/[id]/views API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET returns 400 for missing id', async () => {
    const { req, res } = createMocks({ method: 'GET', query: {} });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().error).toMatch(/Invalid id/);
  });

  it('GET returns views for valid id', async () => {
    (getStartupViews as jest.Mock).mockResolvedValue(42);
    const { req, res } = createMocks({ method: 'GET', query: { id: 'abc' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().views).toBe(42);
  });

  it('POST updates and returns views for valid id', async () => {
    (updateStartupViews as jest.Mock).mockResolvedValue(undefined);
    (getStartupViews as jest.Mock).mockResolvedValue(99);
    const { req, res } = createMocks({ method: 'POST', query: { id: 'abc' } });
    await handler(req, res);
    expect(updateStartupViews).toHaveBeenCalledWith('abc');
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().views).toBe(99);
  });

  it('returns 405 for unsupported method', async () => {
    const { req, res } = createMocks({ method: 'PUT', query: { id: 'abc' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it('GET returns 500 on error', async () => {
    (getStartupViews as jest.Mock).mockRejectedValue(new Error('fail'));
    const { req, res } = createMocks({ method: 'GET', query: { id: 'error-id' } }); // use a unique id
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData().error).toMatch(/Failed to fetch views/);
  });

  it('POST returns 500 on error', async () => {
    (updateStartupViews as jest.Mock).mockRejectedValue(new Error('fail'));
    const { req, res } = createMocks({ method: 'POST', query: { id: 'error-id-2' } }); // use another unique id
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData().error).toMatch(/Failed to update views/);
  });
});

afterAll(async () => {
  const client = await clientPromise;
  await client.close();
});
