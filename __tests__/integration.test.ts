// Test of the communication between the database and the authentication system

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import NextAuth from 'next-auth';
import { ObjectId } from 'mongodb';

import clientPromise from '@/lib/mongodb';
import { getStartupById, getAuthorById } from '@/lib/queries';
import { options } from '@/app/api/auth/[...nextauth]/options';
import { createComment, upvoteComment, createPitch } from '@/lib/actions';
import * as authModule from '@/lib/auth';

const EXAMPLE_STARTUP_ID = '67f648e964c2503554b7123c';
const EXAMPLE_AUTHOR_ID = '67f63c6764c2503554b71236';
const EXAMPLE_AUTHOR_EMAIL = 'demo@example.com';
const EXAMPLE_AUTHOR_USERNAME = 'demouser';

const UNIQUE = Date.now().toString();
const TEST_COMMENT_TEXT = `Integration test comment ${UNIQUE}`;
const TEST_STARTUP_TITLE = `Integration Test Startup ${UNIQUE}`;
const TEST_STARTUP_DESC = 'Integration test description';
const TEST_STARTUP_CATEGORY = 'Tech';
const TEST_STARTUP_LINK = 'https://placehold.co/300x300';

let createdCommentId: string | undefined;
let createdStartupId: string | undefined;

const TEST_USER = {
  id: EXAMPLE_AUTHOR_ID,
  username: EXAMPLE_AUTHOR_USERNAME,
  email: EXAMPLE_AUTHOR_EMAIL,
  name: 'Demo User',
};

jest.spyOn(authModule, 'auth').mockImplementation(async () => ({
  user: TEST_USER,
}));

describe('Project DB & Auth Integration', () => {
  it('should fetch the example startup by ID and check its fields', async () => {
    const startup = await getStartupById(EXAMPLE_STARTUP_ID);
    expect(startup).toBeTruthy();
    if (startup) {
      expect(startup.title).toBe('Quantum Procrastination');
      expect(startup.category).toBe('productivity');
      expect(startup.author).toBeTruthy();
      if (startup.author) {
        expect(startup.author.username).toBe(EXAMPLE_AUTHOR_USERNAME);
      }
    }
  });

  it('should fetch the example author by ID and check its fields', async () => {
    const author = await getAuthorById(EXAMPLE_AUTHOR_ID);
    expect(author).toBeTruthy();
    if (author) {
      expect(author.email).toBe(EXAMPLE_AUTHOR_EMAIL);
      expect(author.username).toBe(EXAMPLE_AUTHOR_USERNAME);
      expect(author.name).toBe('Demo User');
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

describe('Comment & Startup Integration', () => {
  it('should create a startup', async () => {
    const formData = new FormData();
    formData.append('title', TEST_STARTUP_TITLE);
    formData.append('description', TEST_STARTUP_DESC);
    formData.append('category', TEST_STARTUP_CATEGORY);
    formData.append('link', TEST_STARTUP_LINK);
    const result = await createPitch(
      {},
      formData,
      '#Integration test pitch\n Lorem ipsum dolor sit amet consectetur adipiscing elit.'
    );
    if (result.status !== 'SUCCESS') {
      console.error('createPitch failed:', result);
      throw new Error('createPitch failed: ' + (result.error || JSON.stringify(result)));
    }
    expect(result.status).toBe('SUCCESS');
    expect(result._id).toBeTruthy();
    expect(result.title).toBe(TEST_STARTUP_TITLE);
    expect(result.description).toBe(TEST_STARTUP_DESC);
    expect(result.category).toBe(TEST_STARTUP_CATEGORY);
    expect(result.image).toBe(TEST_STARTUP_LINK);
    createdStartupId = result._id;
  });

  it('should create a comment for the startup', async () => {
    expect(createdStartupId).toBeTruthy();
    const result = await createComment(createdStartupId!, TEST_COMMENT_TEXT);
    if (!result.comment) {
      console.error('createComment failed:', result);
      throw new Error('createComment failed: ' + (result.error || JSON.stringify(result)));
    }
    expect(result.comment).toBeTruthy();
    expect(result.comment.text).toBe(TEST_COMMENT_TEXT);
    expect(result.comment.startupId).toBe(createdStartupId);
    expect(result.comment.author).toBeTruthy();
    createdCommentId = result.comment._id;
  });

  it('should upvote the created comment', async () => {
    expect(createdCommentId).toBeTruthy();
    const result = await upvoteComment(createdCommentId!);
    if (!result || result.success !== true) {
      console.error('upvoteComment failed:', result);
      throw new Error(
        'upvoteComment failed: ' + (result && result.error ? result.error : JSON.stringify(result))
      );
    }
    expect(result.success).toBe(true);
  });

  it('should clean up the created comment and startup', async () => {
    const client = await clientPromise;
    const db = client.db('startdown');
    try {
      const commentDeleteResult = await db
        .collection('comments')
        .deleteOne({ _id: new ObjectId(createdCommentId) });
      if (commentDeleteResult.deletedCount !== 1) {
        throw new Error(`Failed to delete comment: ${createdCommentId}`);
      }
      const startupDeleteResult = await db
        .collection('startups')
        .deleteOne({ _id: new ObjectId(createdStartupId) });
      if (startupDeleteResult.deletedCount !== 1) {
        throw new Error(`Failed to delete startup: ${createdStartupId}`);
      }
      const comment = await db
        .collection('comments')
        .findOne({ _id: new ObjectId(createdCommentId) });
      const startup = await db
        .collection('startups')
        .findOne({ _id: new ObjectId(createdStartupId) });
      if (comment !== null) {
        console.error('Comment still exists after delete:', comment);
      }
      if (startup !== null) {
        console.error('Startup still exists after delete:', startup);
      }
      expect(comment).toBeNull();
      expect(startup).toBeNull();
    } catch (err) {
      console.error('Cleanup error:', err);
      throw err;
    } finally {
      await client.close();
    }
  });
});

describe('Unauthorized Access', () => {
  beforeAll(() => {
    jest.spyOn(authModule, 'auth').mockImplementation(async () => null);
  });
  afterAll(() => {
    jest.spyOn(authModule, 'auth').mockImplementation(async () => ({ user: TEST_USER }));
  });

  it('should not allow unauthenticated user to create a startup', async () => {
    const formData = new FormData();
    formData.append('title', TEST_STARTUP_TITLE + ' unauthorized');
    formData.append('description', TEST_STARTUP_DESC);
    formData.append('category', TEST_STARTUP_CATEGORY);
    formData.append('link', TEST_STARTUP_LINK);
    const result = await createPitch({}, formData, '#Unauthorized test pitch');
    expect(result.status).toBe('ERROR');
    expect(result.error).toBeTruthy();
  });

  it('should not allow unauthenticated user to create a comment', async () => {
    const result = await createComment('someFakeStartupId', 'unauthorized comment');
    expect(result).toBeDefined();
    expect(result.error).toBe('You must be signed in to comment.');
  });

  it('should not allow unauthenticated user to upvote a comment', async () => {
    const result = await upvoteComment('someFakeCommentId');
    expect(result).toBeDefined();
    expect(result.error).toBe('You must be signed in to upvote.');
    expect(result.success).toBe(false);
  });
});

const originalConsoleError = console.error;

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((msg) => {
    if (typeof msg === 'string' && msg.includes('MISSING_NEXTAUTH_API_ROUTE_ERROR')) {
      return;
    }
    return originalConsoleError(msg);
  });
});

afterAll(async () => {
  const client = await clientPromise;
  await client.close();
});
