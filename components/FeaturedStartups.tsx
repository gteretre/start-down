'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import StartupCard from './StartupCard';
import type { Startup } from '@/lib/models';
import { ArrowRightIcon, ArrowLeftIcon } from 'lucide-react';

interface FeaturedStartupsProps {
  startups: Startup[];
}

const CARDS_PER_PAGE = 2;
const REFRESH_INTERVAL = 120_000;
const CAROUSEL_ADVANCE_INTERVAL = 10_000;

const FeaturedStartups: React.FC<FeaturedStartupsProps> = ({ startups }) => {
  const [page, setPage] = useState(0);
  const [posts, setPosts] = useState<Startup[]>(startups);
  const totalPages = Math.ceil(startups.length / CARDS_PER_PAGE);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const postsRef = useRef(posts);
  const prevPageRef = useRef(page);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useEffect(() => {
    setPosts(startups);
  }, [startups]);

  const fetchAndUpdateViews = useCallback(async () => {
    const currentPosts = postsRef.current;
    if (currentPosts.length === 0) return;
    const ids = currentPosts.map((post) => post._id.toString());
    try {
      const response = await fetch('/api/startup/views/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) return;
      const data: { views: { [key: string]: number } } = await response.json();
      const viewsMap = data.views;
      setPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          views: viewsMap[post._id.toString()] ?? post.views,
        }))
      );
    } catch (error) {
      console.error('Error fetching or updating batch views:', error);
    }
  }, []);

  useEffect(() => {
    if (!isHovered) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      return;
    }
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    if (posts.length > 0) {
      intervalIdRef.current = setInterval(fetchAndUpdateViews, REFRESH_INTERVAL);
    }
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [fetchAndUpdateViews, posts.length, isHovered]);

  useEffect(() => {
    if (prevPageRef.current !== page) {
      const timeout = setTimeout(() => {}, 500);
      return () => clearTimeout(timeout);
    }
    prevPageRef.current = page;
  }, [page]);

  useEffect(() => {
    if (isHovered) return;
    const autoAdvance = setInterval(() => {
      setPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
    }, CAROUSEL_ADVANCE_INTERVAL);
    return () => clearInterval(autoAdvance);
  }, [totalPages, isHovered]);

  const handleDotClick = (idx: number) => {
    setPage(idx);
  };

  const handlePrev = () => {
    setPage((p) => Math.max(0, p - 1));
  };
  const handleNext = () => {
    setPage((p) => Math.min(totalPages - 1, p + 1));
  };

  const cardWidth = `calc(50% / ${CARDS_PER_PAGE})`;
  const rowWidth = `${posts.length * 100}%`;
  const translateX = `-${(100 / CARDS_PER_PAGE) * page}%`;

  return (
    <div
      className="mx-auto w-full max-w-5xl px-2 py-8 pb-16 sm:px-4 sm:pb-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <p className="mb-8 text-center text-xl font-bold text-primary lg:text-2xl">
        Featured Startups{' '}
        <span className="text-sm font-medium text-muted-foreground sm:text-base">
          ({posts.length})
        </span>
      </p>
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl font-bold text-foreground shadow-lg transition-colors hover:bg-accent disabled:opacity-30 sm:h-12 sm:w-12 sm:text-2xl"
          aria-label="Previous"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <div className="relative flex min-h-[320px] flex-1 overflow-hidden">
          <div className="flex w-full">
            <div
              className="flex px-2 py-2 transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]"
              style={{
                width: rowWidth,
                transform: `translateX(${translateX})`,
              }}
            >
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="max-w-full flex-shrink-0 rounded-xl bg-card px-1 transition-shadow duration-300 hover:shadow-lg"
                  style={{ width: cardWidth }}
                >
                  <StartupCard post={post} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={handleNext}
          disabled={page === totalPages - 1}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl font-bold text-foreground shadow-lg transition-colors hover:bg-accent disabled:opacity-30 sm:h-12 sm:w-12 sm:text-2xl"
          aria-label="Next"
        >
          <ArrowRightIcon size={20} />
        </button>
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`mx-1 h-5 w-5 rounded-full border-2 border-primary transition-colors duration-200 sm:h-3 sm:w-3 ${idx === page ? 'bg-primary' : 'bg-muted-foreground'}`}
            aria-label={`Go to page ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedStartups;
