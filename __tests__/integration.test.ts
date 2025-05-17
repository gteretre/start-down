import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { ObjectId } from 'mongodb';

import clientPromise from '@/lib/mongodb';
import { getStartupById, getAuthorById } from '@/lib/queries';
import { createComment, upvoteComment, createPitch } from '@/lib/actions';
import * as authModule from '@/lib/auth';
import { createAuthor, deleteUser, deleteStartup } from '@/lib/mutations';

beforeAll(async () => {
  const client = await clientPromise;
  await client
    .db('startdown')
    .collection('startups')
    .deleteMany({ slug: { $in: ['test', 'test_creation'] } });
});

const TEST_COMMENT_TEXT = `Integration test comment`;
const TEST_STARTUP_TITLE = `Integration Test Startup`;
const TEST_STARTUP_DESC = 'Integration test description';
const TEST_STARTUP_CATEGORY = 'Tech';
const TEST_STARTUP_LINK = 'https://placehold.co/300x300';

let createdCommentId: string | undefined;
let createdStartupId: string | undefined;
let createdStartupId2: string | undefined;

const TEST_USER = {
  id: '67f63c6764c2503554b71236',
  username: 'testuser',
  email: 'test@example.com',
  name: 'Demo User',
  provider: 'demo',
};

beforeAll(async () => {
  // 1. Create test user in DB
  const userResult = await createAuthor({
    username: TEST_USER.username,
    email: TEST_USER.email,
    name: TEST_USER.name,
    provider: TEST_USER.provider,
    image: '',
    bio: '',
    id: 'test',
    createdAt: new Date(),
  });
  TEST_USER.id = userResult._id;

  // 2. Mock auth to always return this user
  jest.spyOn(authModule, 'auth').mockImplementation(async () => ({
    user: TEST_USER,
  }));

  // 3. Create a startup for tests (slug: 'test')
  const { createStartup } = await import('@/lib/mutations');
  const startupResult = await createStartup({
    title: `Integration Test Startup`,
    description: 'Integration test description',
    category: 'Tech',
    image: 'https://placehold.co/300x300',
    author: userResult._id,
    slug: 'test',
    pitch: '# Integration test pitch\n Lorem ipsum dolor sit amet consectetur adipiscing elit.',
    views: 100,
    likes: 0,
  });
  createdStartupId = startupResult._id;
});

afterAll(async () => {
  const client = await clientPromise;
  // ? We may want to delete the startup created in the beforeAll
  // but it should be already deleted
  // if (createdStartupId) {
  //   const result = await deleteStartup(createdStartupId);
  //   if (!result.success) {
  //     console.error('Failed to delete startup:', createdStartupId, result);
  //   }
  // }
  if (createdStartupId2) {
    const result = await deleteStartup(createdStartupId2);
    if (!result.success) {
      console.error('Failed to delete startup2:', createdStartupId2, result);
    }
  }
  const result = await deleteUser('testuser_updated');
  if (!result.success) {
    console.error('Failed to delete user:', 'testuser_updated', result);
  }
  await client.close();
});

jest.spyOn(authModule, 'auth').mockImplementation(async () => ({
  user: TEST_USER,
}));

describe('Project DB & Auth Integration', () => {
  it('should fetch the created startup by ID and check its fields', async () => {
    const startup = await getStartupById(createdStartupId!);
    expect(startup).toBeTruthy();
    if (startup) {
      expect(startup.title).toContain('Integration Test Startup'); // or whatever title you use
      expect(startup.category).toBe(TEST_STARTUP_CATEGORY);
      expect(startup.author).toBeTruthy();
      if (startup.author) {
        expect(startup.author.username).toBe(TEST_USER.username);
      }
    }
  });

  it('should fetch the created author by ID and check its fields', async () => {
    const author = await getAuthorById(TEST_USER.id);
    expect(author).toBeTruthy();
    if (author) {
      expect(author.email).toBe(TEST_USER.email);
      expect(author.username).toBe(TEST_USER.username);
      expect(author.name).toBe(TEST_USER.name);
    }
  });

  it('should authenticate the demo user and create a session', async () => {
    jest.spyOn(authModule, 'auth').mockImplementation(async () => ({ user: TEST_USER }));
    const session = await authModule.auth();
    expect(session).toBeDefined();
    if (session && session.user) {
      expect(session.user.username).toBe(TEST_USER.username);
      expect(session.user.email).toBe(TEST_USER.email);
      expect(session.user.name).toBe(TEST_USER.name);
    } else {
      throw new Error('Session or session.user is undefined');
    }
  });
});

describe('Comment & Startup Integration', () => {
  it('should create a startup', async () => {
    const formData = new FormData();
    formData.append('title', TEST_STARTUP_TITLE);
    formData.append('description', TEST_STARTUP_DESC);
    formData.append('category', TEST_STARTUP_CATEGORY);
    formData.append('link', TEST_STARTUP_LINK);
    formData.append('slug', 'test_creation');
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
    createdStartupId2 = result._id;
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
    expect(result.comment.startupId.toString()).toBe(createdStartupId!.toString());
    expect(result.comment.author).toBeTruthy();
    createdCommentId = result.comment._id.toString();
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
      // await client.close();
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

describe('Profile Update Integration', () => {
  beforeAll(() => {
    jest.spyOn(authModule, 'auth').mockImplementation(async () => ({ user: TEST_USER }));
  });

  it('should update the demo user profile using updateProfile', async () => {
    const { updateProfile } = await import('@/lib/actions');
    const NEW_NAME = 'Demo User Updated';
    const NEW_USERNAME = 'testuser_updated';
    const NEW_BIO = 'Integration test bio';
    const updateData = {
      name: NEW_NAME,
      username: NEW_USERNAME,
      image: '',
      bio: NEW_BIO,
    };
    const result = await updateProfile(updateData);
    if ('error' in result) {
      throw new Error('updateProfile failed: ' + result.error);
    }
    const successResult = result as {
      status: string;
      user: { name: string; username: string; bio: string };
    };
    expect(successResult.status).toBe('SUCCESS');
    expect(successResult.user).toBeDefined();
    expect(successResult.user.name).toBe(NEW_NAME);
    expect(successResult.user.username).toBe(NEW_USERNAME);
    expect(successResult.user.bio).toBe(NEW_BIO);
  });
});
