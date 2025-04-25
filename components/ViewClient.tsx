'use client';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import Ping from '@/components/Ping';
import { formatNumber } from '@/lib/utils';
import Tooltip from './Tooltip';
import { useToast } from '@/hooks/use-toast';
import { EyeIcon } from 'lucide-react';

function getVisitorId() {
  let id = document.cookie.match(/(^|;) ?visitor_id=([^;]*)(;|$)/)?.[2];
  if (!id) {
    id = crypto.randomUUID();
    document.cookie = `visitor_id=${id}; path=/; max-age=31536000`;
  }
  return id;
}

const fetcher = (id: string) => fetch(`/api/startup/${id}/views`).then((res) => res.json());

const ViewClient = ({
  id,
  initialViews = 0,
  incrementOnMount = false,
  isLoggedIn = false,
}: {
  id: string;
  initialViews?: number;
  incrementOnMount?: boolean;
  isLoggedIn?: boolean;
}) => {
  const { toast } = useToast();
  const hasPostedRef = useRef(false);

  // SWR: do not fetch on mount, only after mutate is called
  const { data, mutate } = useSWR(id ? `/api/startup/${id}/views` : null, () => fetcher(id), {
    fallbackData: { views: initialViews },
    revalidateOnFocus: false,
    revalidateOnMount: false,
    refreshInterval: 0, // We'll handle polling manually
  });

  const [animate, setAnimate] = useState(false);
  const prevViews = useRef(data?.views ?? initialViews);

  // Start polling after 7 seconds
  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(() => {
      mutate(); // First fetch after 7s
      const interval = setInterval(() => {
        mutate();
      }, 7000);
      return () => clearInterval(interval);
    }, 7000);
    return () => clearTimeout(timer);
  }, [id, mutate]);

  useEffect(() => {
    if (!id || !incrementOnMount || hasPostedRef.current) return;
    if (!isLoggedIn) {
      toast({
        title: 'Not logged in',
        description: 'You must be logged in for Your view to be counted.',
        variant: 'destructive',
      });
      return;
    }
    const visitorId = getVisitorId();
    const storageKey = `viewed_${id}_${visitorId}`;
    const lastViewed = localStorage.getItem(storageKey);
    const now = Date.now();

    // 24 hours in milliseconds
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (!lastViewed || now - Number(lastViewed) > TWENTY_FOUR_HOURS) {
      localStorage.setItem(storageKey, now.toString());
      hasPostedRef.current = true;
      fetch(`/api/startup/${id}/views`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId }),
      })
        .then(() => {
          mutate(); // Only re-fetch after increment
        })
        .catch((error) => {
          console.error('Error posting view:', error);
        });
    }
  }, [id, mutate, incrementOnMount, isLoggedIn, toast]);

  useEffect(() => {
    if (prevViews.current !== data?.views) {
      setAnimate(true);
      prevViews.current = data?.views ?? initialViews;
      const timeout = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [data?.views, initialViews]);

  const views = data?.views ?? initialViews;

  return (
    <Tooltip text={`${views} Views`}>
      <div className="flex cursor-default items-center gap-1">
        <EyeIcon className="size-6 text-primary" />
        <span className={`text-16-medium flex gap-1 ${animate ? 'view-update-animate' : ''}`}>
          {formatNumber(views)}
          <span className="-translate-y-px translate-x-4">
            <Ping />
          </span>
        </span>
      </div>
    </Tooltip>
  );
};

export default ViewClient;
