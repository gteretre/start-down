'use client';

import { useState, useEffect, useRef, useCallback, createElement } from 'react';
import type { Startup } from '@/lib/models';
import StartupCard from './StartupCard';
import StartupCardSmall from './StartupCardSmall';
import StartupCardList from './StartupCardList';

const REFRESH_INTERVAL = 120000;
type ViewType = 'card' | 'small' | 'list';
interface StartupListClientWrapperProps {
  initialPosts: Startup[];
  ulClass: string;
  viewType: ViewType;
}

const cardComponents: {
  [key in ViewType]: React.FC<{ post: Startup } | { posts: Startup[] }>;
} = {
  card: StartupCard,
  small: StartupCardSmall,
  list: StartupCardList,
};

const StartupListClientWrapper: React.FC<StartupListClientWrapperProps> = ({
  initialPosts,
  ulClass,
  viewType,
}) => {
  const [posts, setPosts] = useState<Startup[]>(initialPosts);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const postsRef = useRef(posts);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

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

    if (posts.length > 0 && viewType !== 'list') {
      intervalIdRef.current = setInterval(fetchAndUpdateViews, REFRESH_INTERVAL);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [fetchAndUpdateViews, posts.length, viewType]);

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
    <ul className={ulClass}>
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
