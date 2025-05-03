import { getCommentsByStartupId } from '@/lib/queries';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startupId = searchParams.get('startupId');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  if (!startupId) return new Response('Missing startupId', { status: 400 });

  // Fetch all comments for now (you can optimize with skip/limit later)
  const allComments = await getCommentsByStartupId(startupId);

  // Paginate manually
  const start = (page - 1) * limit;
  const end = start + limit;
  // Map userUpvotes to string array for client safety
  const paginated = allComments.slice(start, end).map((comment) => ({
    ...comment,
    userUpvotes: (comment.userUpvotes || []).map((id) => id.toString()),
  }));

  return Response.json({
    comments: paginated,
    hasMore: end < allComments.length,
  });
}
