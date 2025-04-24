import type { NextApiRequest, NextApiResponse } from 'next';
import { getStartupViews } from '@/lib/queries';
import { updateStartupViews } from '@/lib/mutations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  if (req.method === 'GET') {
    try {
      const views = await getStartupViews(id);
      return res.status(200).json({ views });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch views: ' + error.message });
    }
  } else if (req.method === 'POST') {
    try {
      await updateStartupViews(id);
      const views = await getStartupViews(id);
      return res.status(200).json({ views });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update views: ' + error.message });
    }
  } else {
    return res.status(405).end();
  }
}
