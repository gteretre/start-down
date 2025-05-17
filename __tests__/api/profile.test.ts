import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

import { getDb } from '@/lib/mongodb';
import { getAuthorByUsername } from '@/lib/queries';

jest.mock('@/lib/auth', () => ({
  __esModule: true,
  auth: jest.fn(),
}));
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  getDb: jest.fn(),
}));
jest.mock('@/lib/queries', () => ({
  __esModule: true,
  getAuthorByUsername: jest.fn(),
}));
jest.mock('@/api-middleware/rateLimits', () => ({
  __esModule: true,
  rateLimit: jest.fn(() => ({ limited: false })),
}));

const TEST_USER = {
  _id: '507f1f77bcf86cd799439011',
  id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  createdAt: new Date(),
  image: '',
  bio: '',
  role: '',
  provider: '',
};

describe('PATCH /api/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ user: TEST_USER });
    (getAuthorByUsername as jest.Mock).mockResolvedValue(TEST_USER);
    (getDb as jest.Mock).mockResolvedValue({
      collection: () => ({
        findOne: jest.fn(),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
        find: jest.fn(),
      }),
    });
  });

  it('should return 401 if not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ username: 'newuser', name: 'Name', image: '', bio: '' }),
    });
    const { PATCH } = await import('@/app/api/profile/route');
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('authenticated');
  });

  it('should return 400 for forbidden username', async () => {
    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ username: 'admin', name: 'Name', image: '', bio: '' }),
    });
    const { PATCH } = await import('@/app/api/profile/route');
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('not allowed');
  });

  it('should return 400 for username length', async () => {
    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ username: 'abc', name: 'Name', image: '', bio: '' }),
    });
    const { PATCH } = await import('@/app/api/profile/route');
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('between 6 and 50');
  });

  it('should return 400 for bio length', async () => {
    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        username: 'validuser',
        name: 'Name',
        image: '',
        bio: 'a'.repeat(501),
      }),
    });
    const { PATCH } = await import('@/app/api/profile/route');
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Failed to update profile');
  });

  it('should return 400 for username taken', async () => {
    (getAuthorByUsername as jest.Mock).mockResolvedValueOnce(TEST_USER);
    (getDb as jest.Mock).mockResolvedValue({
      collection: () => ({
        findOne: jest.fn().mockResolvedValue({ _id: 'otherid' }),
        updateOne: jest.fn(),
        find: jest.fn(),
      }),
    });
    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ username: 'takenuser', name: 'Name', image: '', bio: '' }),
    });
    const { PATCH } = await import('@/app/api/profile/route');
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('already taken');
  });

  it('should return 400 for DB update failure', async () => {
    (getDb as jest.Mock).mockResolvedValue({
      collection: () => ({
        findOne: jest.fn().mockResolvedValue(null),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
      }),
    });
    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ username: 'validuser', name: 'Name', image: '', bio: '' }),
    });
    const { PATCH } = await import('@/app/api/profile/route');
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Failed to update profile');
  });

  it('should return 200 for success', async () => {
    (getDb as jest.Mock).mockResolvedValue({
      collection: () => ({
        findOne: jest.fn().mockResolvedValue(TEST_USER),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      }),
    });
    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ username: 'validuser', name: 'Name', image: '', bio: 'bio' }),
    });
    const { PATCH } = await import('@/app/api/profile/route');
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('SUCCESS');
    expect(data.user).toBeDefined();
  });
});
