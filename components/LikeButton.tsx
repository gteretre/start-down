'use client';
import { useState, useEffect, useRef } from 'react';
import { HeartIcon } from 'lucide-react';
import useSWR from 'swr';

import { toggleLikeStartup } from '@/lib/actions';
import Tooltip from './Tooltip';

interface LikeButtonProps {
  startupId: string;
  initialLiked: boolean;
  initialLikes: number;
  username?: string;
  authorUsername?: string;
  userObjectId?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LikeButton({
  startupId,
  initialLiked,
  initialLikes,
  username,
  authorUsername,
}: LikeButtonProps) {
  const REFRESH_INTERVAL = 10_000;
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { data, mutate } = useSWR(startupId ? `/api/startup/${startupId}/stats` : null, fetcher, {
    fallbackData: { likes: initialLikes },
    revalidateOnFocus: true,
    revalidateOnMount: false,
    refreshInterval: isVisible ? REFRESH_INTERVAL : 0,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    dedupingInterval: REFRESH_INTERVAL,
    isPaused: () => !isVisible,
  });
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState(data?.likes ?? initialLikes);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (typeof data?.likes === 'number') {
      setLikes(data.likes);
    }
  }, [data?.likes]);

  useEffect(() => {
    if (liked) {
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [liked]);

  const isAuthor = username && authorUsername && username === authorUsername;
  const canLike = !!username && !isAuthor;

  const handleLike = async () => {
    if (!canLike || loading) return;
    setLoading(true);
    try {
      const result = await toggleLikeStartup(startupId, username!);
      if (result && result.success && typeof result.toggled === 'boolean') {
        setLiked(result.toggled);
        setLikes((prev: number) => (result.toggled ? prev + 1 : prev - 1));
        mutate();
      }
    } finally {
      setLoading(false);
    }
  };

  let buttonTitle = liked ? 'Unlike' : 'Like';
  if (!username) buttonTitle = 'Sign in to like';
  else if (isAuthor) buttonTitle = 'Authors cannot like their own startup';

  return (
    <div ref={containerRef}>
      <Tooltip text={buttonTitle}>
        <button
          onClick={handleLike}
          disabled={!canLike || loading}
          className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition ${liked ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10'}`}
          aria-pressed={liked}
        >
          <HeartIcon
            className={`h-4 w-4 transition-transform duration-300 ${animate ? 'scale-125' : ''}`}
            fill={liked ? 'currentColor' : 'none'}
          />
          <span>{likes}</span>
        </button>
      </Tooltip>
    </div>
  );
}
