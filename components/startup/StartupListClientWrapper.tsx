'use client';

import { useState, useEffect, useRef, useCallback, createElement } from 'react';
import type { Startup } from '@/lib/models';
import StartupCard from './StartupCard';
import StartupCardSmall from './StartupCardSmall';
import StartupCardList from './StartupCardList';

const REFRESH_INTERVAL = 120_000;
type ViewType = 'card' | 'small' | 'list';
interface StartupListClientWrapperProps {
  initialPosts: Startup[];
  ulClass: string;
  viewType: ViewType;
}

const cardComponents = {
  card: StartupCard as React.FC<{ post: Startup }>,
  small: StartupCardSmall as React.FC<{ post: Startup }>,
  list: StartupCardList as React.FC<{ posts: Startup[] }>,
};

const StartupListClientWrapper: React.FC<StartupListClientWrapperProps> = ({
  initialPosts,
  ulClass,
  viewType,
}) => {
  const [posts, setPosts] = useState<Startup[]>(initialPosts);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const postsRef = useRef(posts);
  const containerRef = useRef<HTMLUListElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isTabActive, setIsTabActive] = useState(true);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

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

  useEffect(() => {
    const handleVisibility = () => setIsTabActive(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const CardComponent = cardComponents[viewType];

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
      if (!response.ok) {
        let errorBody = 'Failed to fetch batch views';
        try {
          errorBody = await response.text();
        } catch {
          console.error('Failed to read error response text');
        }
        throw new Error(`HTTP error ${response.status}: ${errorBody}`);
      }
      const data: { views: { [key: string]: number } } = await response.json();
      const viewsMap = data.views;

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          const postIdStr = post._id.toString();
          return {
            ...post,
            views: viewsMap[postIdStr] ?? post.views,
          };
        })
      );
    } catch (error) {
      console.error('Error fetching or updating batch views:', error);
    }
  }, []);

  useEffect(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    if (posts.length > 0 && viewType !== 'list' && isVisible && isTabActive) {
      intervalIdRef.current = setInterval(fetchAndUpdateViews, REFRESH_INTERVAL);
    }
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [fetchAndUpdateViews, posts.length, viewType, isVisible, isTabActive]);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  if (!CardComponent) {
    console.error(`Invalid viewType provided: ${viewType}`);
    return null;
  }

  if (viewType === 'list') {
    const ListComponent = CardComponent as React.FC<{ posts: Startup[] }>;
    return <ListComponent posts={posts} />;
  }

  return (
    <ul ref={containerRef} className={ulClass}>
      {posts.map((post) =>
        createElement(CardComponent as React.FC<{ post: Startup }>, {
          key: post._id.toString(),
          post: post,
        })
      )}
    </ul>
  );
};

export default StartupListClientWrapper;
