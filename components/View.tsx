'use client';
import useSWR from 'swr';
import { formatNumber } from '@/lib/utils';
import Tooltip from './Tooltip';
import { EyeIcon } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

const fetcher = (id: string) => fetch(`/api/startup/${id}/views`).then((res) => res.json());

const View = ({ id, initialViews = 0 }: { id: string; initialViews?: number }) => {
  const { data } = useSWR(id ? `/api/startup/${id}/views` : null, () => fetcher(id), {
    fallbackData: { views: initialViews },
    revalidateOnFocus: true,
    refreshInterval: 120000,
  });

  const views = data?.views ?? initialViews;
  const prevViews = useRef(views);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (prevViews.current !== views) {
      setAnimate(true);
      prevViews.current = views;
      const timeout = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [views]);

  return (
    <Tooltip text={`${views} Views`}>
      <div className="flex gap-1">
        <EyeIcon className="size-6 text-primary" />
        <span className="text-16-medium">
          <span className={`flex ${animate ? 'view-update-animate' : ''}`}>
            {formatNumber(views)}
          </span>
        </span>
      </div>
    </Tooltip>
  );
};

export default View;
