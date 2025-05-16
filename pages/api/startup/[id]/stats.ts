import type { NextApiRequest, NextApiResponse } from 'next';
import { getStartupStats } from '@/lib/queries';
import { updateStartupViews } from '@/lib/mutations';

// Simple in-memory cache for stats
const cache = new Map<string, { views: number; likes: number; ts: number }>();
const CACHE_TTL = 10_000;

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
          return res.status(200).json({ views: cached.views, likes: cached.likes });
        }
      }
      const { views, likes } = await getStartupStats(id);
      cache.set(id, { views, likes, ts: Date.now() });
      return res.status(200).json({ views, likes });
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      return res.status(500).json({ error: 'Failed to fetch stats: ' + message });
    }
  } else if (req.method === 'POST') {
    try {
      await updateStartupViews(id);
      const { views, likes } = await getStartupStats(id);
      cache.set(id, { views, likes, ts: Date.now() });
      return res.status(200).json({ views, likes });
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      return res.status(500).json({ error: 'Failed to update stats: ' + message });
    }
  } else {
    return res.status(405).end();
  }
}
