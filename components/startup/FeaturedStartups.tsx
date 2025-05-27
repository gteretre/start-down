'use client';
import React, { useState, useEffect, useRef } from 'react';
import StartupCard from '@/components/startup/StartupCard';
import type { Startup } from '@/lib/models';
import { ArrowRightIcon, ArrowLeftIcon } from 'lucide-react';

interface FeaturedStartupsProps {
  startups: Startup[];
}

const CAROUSEL_ADVANCE_INTERVAL = 10_000;
const ANIMATION_DURATION = 150;

const FeaturedStartups: React.FC<FeaturedStartupsProps> = ({ startups }) => {
  const [page, setPage] = useState(0);
  const [posts, setPosts] = useState<Startup[]>(startups);
  const [isHovered, setIsHovered] = useState(false);
  const autoAdvanceIntervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [cardsPerPage, setCardsPerPage] = useState(2);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setPosts(startups);
    changePageHandler(0);
  }, [startups]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const calculateCardsPerPage = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 768) {
          return 1;
        } else {
          return 2;
        }
      }
      return 2;
    };
    const handleResize = () => {
      setCardsPerPage(calculateCardsPerPage());
      changePageHandler(0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = cardsPerPage > 0 ? Math.ceil(posts.length / cardsPerPage) : 0;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (autoAdvanceIntervalIdRef.current) {
      clearInterval(autoAdvanceIntervalIdRef.current);
    }
    if (!isHovered && totalPages > 1) {
      autoAdvanceIntervalIdRef.current = setInterval(() => {
        changePageHandler((prev) => (prev >= totalPages - 1 ? 0 : prev + 1));
      }, CAROUSEL_ADVANCE_INTERVAL);
    }
    return () => {
      if (autoAdvanceIntervalIdRef.current) {
        clearInterval(autoAdvanceIntervalIdRef.current);
      }
    };
  }, [totalPages, isHovered]);

  useEffect(() => {
    if (cardsContainerRef.current) {
      cardsContainerRef.current.style.opacity = '1';
    }
  }, [page]);

  const changePageHandler = (newPageOrFn: number | ((prevPage: number) => number)) => {
    if (typeof newPageOrFn === 'number' && newPageOrFn === page && totalPages > 1) {
      return;
    }
    if (cardsContainerRef.current) {
      cardsContainerRef.current.style.opacity = '0';
    }
    setTimeout(() => {
      setPage(newPageOrFn);
    }, ANIMATION_DURATION);
  };

  const handleDotClick = (idx: number) => {
    changePageHandler(idx);
  };

  const handlePrev = () => {
    if (totalPages <= 1) return;
    changePageHandler((prevPage) => (prevPage - 1 + totalPages) % totalPages);
  };
  const handleNext = () => {
    if (totalPages <= 1) return;
    changePageHandler((prevPage) => (prevPage + 1) % totalPages);
  };

  const startIndex = page * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const visiblePosts = posts.slice(startIndex, endIndex);

  if (!startups || startups.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl px-2 py-8 pb-16 text-center sm:px-4 sm:pb-8">
        <p className="text-lg text-muted-foreground">No featured startups at the moment.</p>
      </div>
    );
  }

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
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl font-bold text-foreground shadow-lg transition-colors hover:bg-accent disabled:opacity-30 sm:h-12 sm:w-12 sm:text-2xl"
          aria-label="Previous"
          disabled={totalPages <= 1}
        >
          <ArrowLeftIcon size={20} />
        </button>
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={cardsContainerRef}
            className="flex transition-opacity ease-in-out"
            style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
          >
            {visiblePosts.map((post) => (
              <div
                key={post._id}
                className="flex-shrink-0 px-1 py-2 transition-shadow duration-100"
                style={{ width: `${100 / cardsPerPage}%` }}
              >
                <StartupCard post={post} />
              </div>
            ))}
            {visiblePosts.length < cardsPerPage &&
              posts.length > 0 &&
              Array.from({ length: cardsPerPage - visiblePosts.length }).map((_, index) => (
                <div
                  key={`placeholder-${index}`}
                  className="flex-shrink-0 px-1 py-2"
                  style={{ width: `${100 / cardsPerPage}%` }}
                ></div>
              ))}
          </div>
        </div>
        <button
          onClick={handleNext}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl font-bold text-foreground shadow-lg transition-colors hover:bg-accent disabled:opacity-30 sm:h-12 sm:w-12 sm:text-2xl"
          aria-label="Next"
          disabled={totalPages <= 1}
        >
          <ArrowRightIcon size={20} />
        </button>
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`mx-1 h-3 w-3 rounded-full border border-primary transition-colors duration-200 sm:h-2.5 sm:w-2.5 ${idx === page ? 'bg-primary' : 'bg-muted-foreground/50 hover:bg-muted-foreground/70'}`}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedStartups;
