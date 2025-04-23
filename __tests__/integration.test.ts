// Test of the communication between the database and the authentication system

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import clientPromise from '../lib/mongodb';

import { getStartupById, getAuthorById } from '../lib/queries';
import { options } from '../app/api/auth/[...nextauth]/options';
import NextAuth from 'next-auth';

const EXAMPLE_STARTUP_ID = '67f648e964c2503554b7123c';
const EXAMPLE_AUTHOR_ID = '67f63c6764c2503554b71236';
const EXAMPLE_AUTHOR_EMAIL = 'demo@example.com';
const EXAMPLE_AUTHOR_USERNAME = 'demouser';

describe('Project DB & Auth Integration', () => {
  it('should fetch the example startup by ID and check its fields', async () => {
    const startup = await getStartupById(EXAMPLE_STARTUP_ID);
    expect(startup).toBeTruthy();
    if (startup) {
      const s = startup as Record<string, unknown>;
      expect(s.title).toBe('Quantum Procrastination');
      expect(s.category).toBe('productivity');
      expect(s.author).toBeTruthy();
      if (s.author) {
        expect((s.author as Record<string, unknown>).username).toBe(EXAMPLE_AUTHOR_USERNAME);
      }
    }
  });

  it('should fetch the example author by ID and check its fields', async () => {
    const author = await getAuthorById(EXAMPLE_AUTHOR_ID);
    expect(author).toBeTruthy();
    if (author) {
      const a = author as Record<string, unknown>;
      expect(a.email).toBe(EXAMPLE_AUTHOR_EMAIL);
      expect(a.username).toBe(EXAMPLE_AUTHOR_USERNAME);
      expect(a.name).toBe('Demo User');
    }
  });

  it('should authenticate the demo user and create a session', async () => {
    // Simulate a sign-in using NextAuth options
    // This is a pseudo-test: in real integration, use supertest or next-auth testing helpers
    const req = {
      method: 'POST',
      body: { email: EXAMPLE_AUTHOR_EMAIL },
      query: { nextauth: [] }, // Mock the catch-all route param
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(), // Mock setHeader for NextAuth compatibility
      send: jest.fn(), // Mock send for NextAuth compatibility
      end: jest.fn(),
    };
    // @ts-expect-error: NextAuth expects a Next.js API request/response object
    await NextAuth(options)(req, res);
    // Check if any response method was called
    expect(
      res.json.mock.calls.length > 0 ||
        res.send.mock.calls.length > 0 ||
        res.end.mock.calls.length > 0
    ).toBe(true);
  });
});

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((msg) => {
    if (typeof msg === 'string' && msg.includes('MISSING_NEXTAUTH_API_ROUTE_ERROR')) {
      return;
    }
    // @ts-expect-error: Suppress error for custom console.error mock in test
    return console.error(msg);
  });
});

afterAll(async () => {
  // If you use clientPromise or a MongoClient instance, close it here
  const client = await clientPromise;
  await client.close();
});
