jest.mock('@/lib/auth', () => ({
  __esModule: true,
  auth: jest.fn(),
}));

import { NextRequest } from 'next/server';
import * as authModule from '@/lib/auth';

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  getDb: jest.fn(),
}));

const TEST_ID = '507f1f77bcf86cd799439011';
const TEST_USER = { username: 'testuser' };

beforeEach(() => {
  jest.spyOn(authModule, 'auth').mockResolvedValue({ user: TEST_USER });
});
afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/startups', () => {
  it('should return 401 if not authenticated', async () => {
    jest.spyOn(authModule, 'auth').mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost/api/startups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test',
        description: 'desc',
        category: 'cat',
        image: '',
        pitch: 'pitch',
      }),
    });
    const { POST } = await import('@/app/api/startups/route');
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('signed in');
  });

  it('should return 400 for forbidden names', async () => {
    const req = new NextRequest('http://localhost/api/startups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'admin',
        description: 'desc',
        category: 'cat',
        image: '',
        pitch: 'pitch',
      }),
    });
    const { POST } = await import('@/app/api/startups/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Validation failed');
  });

  it('should return 400 for validation errors', async () => {
    const req = new NextRequest('http://localhost/api/startups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '',
        description: '',
        category: '',
        image: '',
        pitch: '',
      }),
    });
    const { POST } = await import('@/app/api/startups/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Validation failed');
    expect(data.details).toBeDefined();
  });
});

describe('PATCH /api/startups/[id]', () => {
  it('should return 401 if not authenticated', async () => {
    jest.spyOn(authModule, 'auth').mockResolvedValueOnce(null);
    const req = new NextRequest(`http://localhost/api/startups/${TEST_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'desc',
        category: 'cat',
        image: '',
        pitch: 'pitch',
      }),
    });
    const params = { id: TEST_ID };
    const { PATCH } = await import('@/app/api/startups/[id]/route');
    const res = await PATCH(req, { params });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('authenticated');
  });

  it('should return 404 if startup not found', async () => {
    const dbModule = await import('@/lib/mongodb');
    (dbModule.getDb as jest.Mock).mockResolvedValue({
      collection: () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }),
    });
    const req = new NextRequest(`http://localhost/api/startups/${TEST_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'desc',
        category: 'cat',
        image: '',
        pitch: 'pitch',
      }),
    });
    const params = { id: TEST_ID };
    const { PATCH } = await import('@/app/api/startups/[id]/route');
    const res = await PATCH(req, { params });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain('not found');
  });

  it('should return 403 if not the author', async () => {
    const dbModule = await import('@/lib/mongodb');
    (dbModule.getDb as jest.Mock).mockResolvedValue({
      collection: () => ({
        findOne: jest
          .fn()
          .mockResolvedValue({ _id: TEST_ID, author: 'otherUserId', title: 'Test' }),
        updateOne: jest.fn(),
      }),
    });
    const queries = await import('@/lib/queries');
    jest.spyOn(queries, 'getAuthorByUsername').mockResolvedValue({
      _id: 'testuserId',
      id: 'testuserId',
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: new Date(),
      image: '',
      bio: '',
      role: '',
      provider: '',
    });
    const req = new NextRequest(`http://localhost/api/startups/${TEST_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'desc',
        category: 'cat',
        image: '',
        pitch: 'pitch',
      }),
    });
    const params = { id: TEST_ID };
    const { PATCH } = await import('@/app/api/startups/[id]/route');
    const res = await PATCH(req, { params });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('authorized');
  });

  it('should return 400 for validation errors', async () => {
    const dbModule = await import('@/lib/mongodb');
    (dbModule.getDb as jest.Mock).mockResolvedValue({
      collection: () => ({
        findOne: jest
          .fn()
          .mockResolvedValue({ _id: TEST_ID, author: TEST_USER.username, title: 'Test' }),
        updateOne: jest.fn(),
      }),
    });
    const queries = await import('@/lib/queries');
    jest.spyOn(queries, 'getAuthorByUsername').mockResolvedValue({
      _id: TEST_USER.username,
      id: TEST_USER.username,
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: new Date(),
      image: '',
      bio: '',
      role: '',
      provider: '',
    });
    const req = new NextRequest(`http://localhost/api/startups/${TEST_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: '',
        category: '',
        image: '',
        pitch: '',
      }),
    });
    const params = { id: TEST_ID };
    const { PATCH } = await import('@/app/api/startups/[id]/route');
    const res = await PATCH(req, { params });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Validation failed');
    expect(data.details).toBeDefined();
  });
});

describe('DELETE /api/startups/[id]', () => {
  it('should return 401 if not authenticated', async () => {
    jest.spyOn(authModule, 'auth').mockResolvedValueOnce(null);
    const req = new NextRequest(`http://localhost/api/startups/${TEST_ID}`, {
      method: 'DELETE',
    });
    const params = { id: TEST_ID };
    const { DELETE } = await import('@/app/api/startups/[id]/route');
    const res = await DELETE(req, { params });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain('authenticated');
  });

  it('should return 404 if startup not found', async () => {
    const dbModule = await import('@/lib/mongodb');
    (dbModule.getDb as jest.Mock).mockResolvedValue({
      collection: () => ({
        findOne: jest.fn().mockResolvedValue(null),
        deleteOne: jest.fn(),
        deleteMany: jest.fn(),
      }),
    });
    const req = new NextRequest(`http://localhost/api/startups/${TEST_ID}`, {
      method: 'DELETE',
    });
    const params = { id: TEST_ID };
    const { DELETE } = await import('@/app/api/startups/[id]/route');
    const res = await DELETE(req, { params });
    const data = await res.json();
    expect(res.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toContain('not found');
  });

  it('should return 403 if not the author', async () => {
    const dbModule = await import('@/lib/mongodb');
    (dbModule.getDb as jest.Mock).mockResolvedValue({
      collection: () => ({
        findOne: jest.fn().mockResolvedValue({ _id: TEST_ID, author: 'otherUserId' }),
        deleteOne: jest.fn(),
        deleteMany: jest.fn(),
      }),
    });
    const queries = await import('@/lib/queries');
    jest.spyOn(queries, 'getAuthorByUsername').mockResolvedValue({
      _id: 'testuserId',
      id: 'testuserId',
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: new Date(),
      image: '',
      bio: '',
      role: '',
      provider: '',
    });
    const req = new NextRequest(`http://localhost/api/startups/${TEST_ID}`, {
      method: 'DELETE',
    });
    const params = { id: TEST_ID };
    const { DELETE } = await import('@/app/api/startups/[id]/route');
    const res = await DELETE(req, { params });
    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.message).toContain('authorized');
  });
});
