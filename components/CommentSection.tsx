'use client';

import { useEffect, useRef, useState } from 'react';
import { ThumbsUpIcon, HeartIcon } from 'lucide-react';
import Image from 'next/image';
import { SendHorizontalIcon } from 'lucide-react';

import { createComment, upvoteComment } from '@/lib/actions';
import { Comment } from '@/lib/models';

export default function CommentSection({
  startupId,
  user,
}: {
  startupId: string;
  user?: { username?: string };
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/comments?startupId=${startupId}&page=${page}&limit=20`)
      .then((res) => res.json())
      .then((data) => {
        setComments((prev) => {
          const ids = new Set(prev.map((c: Comment) => c._id));
          return [...prev, ...data.comments.filter((c: Comment) => !ids.has(c._id))];
        });
        setHasMore(data.hasMore);
        setLoading(false);
      });
  }, [page, startupId]);

  useEffect(() => {
    if (!hasMore || loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setPage((p) => p + 1);
    });
    if (sentinelRef.current) observer.current.observe(sentinelRef.current);
    return () => observer.current?.disconnect();
  }, [hasMore, loading]);

  const handleUpvote = async (commentId: string) => {
    const result = await upvoteComment(commentId);
    if (result && result.success) {
      setComments((prev) =>
        prev.map((c: Comment) => {
          if (c._id !== commentId) return c;
          let userUpvotes = c.userUpvotes || [];
          let upvotes = c.upvotes;
          if (user?.username && userUpvotes.includes(user.username)) {
            userUpvotes = userUpvotes.filter((u: string) => u !== user.username);
            upvotes = upvotes - 1;
          } else if (user?.username) {
            userUpvotes = [...userUpvotes, user.username];
            upvotes = upvotes + 1;
          }
          return { ...c, userUpvotes, upvotes };
        })
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createComment(startupId, newComment);
    if (result && result.comment) {
      setComments((prev) => {
        // Prevent duplicate on submit
        if (prev.some((c: Comment) => c._id === result.comment._id)) return prev;
        // Ensure userUpvotes is present
        const commentWithUpvotes: Comment = {
          userUpvotes: [],
          ...result.comment,
        };
        return [commentWithUpvotes, ...prev];
      });
      setNewComment('');
      setIsTyping(false);
    } else if (result && result.error) {
      alert(result.error);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {user?.username && (
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2 rounded-lg">
          <textarea
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              setIsTyping(e.target.value.length > 0);
            }}
            placeholder="Write a comment..."
            required
            rows={isTyping ? 4 : 1}
            className={`form-input resize-none rounded-md bg-background p-2 text-base transition-all duration-200 focus:ring-2 focus:ring-primary ${isTyping ? 'min-h-[60px]' : 'min-h-[32px]'}`}
            style={{ overflow: 'hidden' }}
          />
          {isTyping && (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary rounded-md px-4 py-1 font-medium shadow-sm transition hover:bg-secondary/90"
                onClick={() => {
                  setNewComment('');
                  setIsTyping(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary rounded-md px-4 py-1 font-medium shadow-sm transition hover:bg-primary/90"
              >
                <span className="flex items-center gap-1">
                  Post <SendHorizontalIcon className="mr-1 inline-block h-4 w-4" />
                </span>
              </button>
            </div>
          )}
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => {
          const hasUpvoted = !!(user?.username && comment.userUpvotes?.includes(user.username));
          return (
            <div key={comment._id} className="flex flex-col gap-2 rounded-lg">
              <div className="flex items-center gap-3">
                {comment.author?.image ? (
                  <Image
                    src={comment.author.image}
                    alt={comment.author.username + ' avatar'}
                    className="h-8 w-8 rounded-full object-cover"
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                    ?
                  </div>
                )}
                <div className="space-x-2">
                  <span className="text-md font-semibold text-foreground">
                    @{comment.author?.username || 'Anonymous'}
                    {user?.username === comment.author?.username ? ' (You)' : ''}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex-1" />
                <button
                  onClick={() => handleUpvote(comment._id)}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition ${hasUpvoted ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10'}`}
                  title={hasUpvoted ? 'Remove upvote' : 'Upvote'}
                  disabled={!user?.username}
                >
                  {hasUpvoted ? (
                    <HeartIcon className="h-4 w-4" />
                  ) : (
                    <ThumbsUpIcon className="h-4 w-4" />
                  )}
                  <span>{comment.upvotes}</span>
                </button>
              </div>
              <div className="whitespace-pre-line break-words pl-11 text-base text-foreground/90">
                {comment.text}
              </div>
              <hr />
            </div>
          );
        })}
      </div>

      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && <div className="py-4 text-center text-muted-foreground">Loading...</div>}
    </div>
  );
}
