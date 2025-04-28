'use server';
import { auth } from '@/lib/auth';
import { parseServerActionResponse, slugify } from './utils';
import { getAuthorByUsername } from '@/lib/queries';
import { createStartup } from '@/lib/mutations';
export const createPitch = async (state, form: FormData, pitch: string) => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: 'Not signed in',
      status: 'ERROR',
    });
  }

  const formEntries = Array.from(form.entries());
  const formData = Object.fromEntries(formEntries);
  const { title, description, category, link } = formData;
  if (!title || !description || !category || !pitch) {
    return parseServerActionResponse({
      error: 'Missing required fields',
      status: 'ERROR',
    });
  }

  // Check if a startup with the same slug exists
  const checkSlugExists = async (slug: string) => {
    const db = await import('./mongodb').then((m) => m.getDb());
    const existing = await (await db).collection('startups').findOne({ slug });
    return !!existing;
  };

  const slug = await slugify(title as string, checkSlugExists);

  try {
    if (!session.user || !('username' in session.user) || !session.user.username) {
      return parseServerActionResponse({
        error: 'User session invalid',
        status: 'ERROR',
      });
    }
    const author = await getAuthorByUsername(session.user.username);

    if (!author) {
      return parseServerActionResponse({
        error: 'Author not found',
        status: 'ERROR',
      });
    }

    const startup = {
      title: title as string,
      description: description as string,
      category: category as string,
      image: link as string,
      slug: slug,
      author: author._id,
      pitch,
      views: 0,
    };

    const result = await createStartup(startup);

    if (!result || !result._id) {
      return parseServerActionResponse({
        error: 'Failed to create startup',
        status: 'ERROR',
      });
    }

    return parseServerActionResponse({
      ...result,
      error: '',
      status: 'SUCCESS',
    });
  } catch (error) {
    return parseServerActionResponse({
      error: typeof error === 'object' ? JSON.stringify(error) : String(error),
      status: 'ERROR',
    });
  }
};
