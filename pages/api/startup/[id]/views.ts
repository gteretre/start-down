import type { NextApiRequest, NextApiResponse } from 'next';
import { getStartupViews } from '@/lib/queries';
import { updateStartupViews } from '@/lib/mutations';

// Simple in-memory cache for views
const cache = new Map<string, { views: number; ts: number }>();
const CACHE_TTL = 10 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  if (req.method === 'GET') {
    try {
      // Check cache first
      if (cache.has(id)) {
        const cached = cache.get(id)!;
        if (Date.now() - cached.ts < CACHE_TTL) {
          return res.status(200).json({ views: cached.views });
        }
      }
      const views = await getStartupViews(id);
      cache.set(id, { views, ts: Date.now() });
      return res.status(200).json({ views });
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      return res.status(500).json({ error: 'Failed to fetch views: ' + message });
    }
  } else if (req.method === 'POST') {
    try {
      await updateStartupViews(id);
      const views = await getStartupViews(id);
      cache.set(id, { views, ts: Date.now() });
      return res.status(200).json({ views });
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      return res.status(500).json({ error: 'Failed to update views: ' + message });
    }
  } else {
    return res.status(405).end();
  }
}
