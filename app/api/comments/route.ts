import { getCommentsByStartupId } from '@/lib/queries';
import { auth } from '@/lib/auth';

const MAX_LIMIT = 20;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startupId = searchParams.get('startupId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(MAX_LIMIT, parseInt(searchParams.get('limit') || '20', 10));

    if (!startupId) {
      return new Response(JSON.stringify({ error: 'Missing startupId' }), { status: 400 });
    }

    const session = await auth();
    const currentUsername = session?.user?.username;

    const { comments, hasMore } = await getCommentsByStartupId(
      startupId,
      currentUsername,
      page,
      limit
    );

    return Response.json({ comments, hasMore });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch comments' }), { status: 500 });
  }
}
