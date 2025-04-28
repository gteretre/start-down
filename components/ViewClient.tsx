'use client';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import Ping from '@/components/Ping';
import { formatNumber } from '@/lib/utils';
import Tooltip from './Tooltip';
import { useToast } from '@/hooks/use-toast';
import { EyeIcon } from 'lucide-react';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const REFRESH_INTERVAL = 10000;
const LIVE_VIEW_MAX_THRESHOLD = 100_000;

function getVisitorId() {
  let id = document.cookie.match(/(^|;) ?visitor_id=([^;]*)(;|$)/)?.[2];
  if (!id) {
    id = crypto.randomUUID();
    document.cookie = `visitor_id=${id}; path=/; max-age=31536000`;
  }
  return id;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ViewClientProps {
  id: string;
  initialViews?: number;
  incrementOnMount?: boolean;
  isLoggedIn?: boolean;
}

const ViewClient = ({
  id,
  initialViews = 0,
  incrementOnMount = false,
  isLoggedIn = false,
}: ViewClientProps) => {
  // Determine refresh interval based on views
  const [dynamicRefresh, setDynamicRefresh] = useState(
    initialViews > LIVE_VIEW_MAX_THRESHOLD ? 0 : REFRESH_INTERVAL
  );

  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to track visibility
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

  const { toast } = useToast();
  const hasPostedRef = useRef(false);
  const [animate, setAnimate] = useState(false);
  const { data, mutate } = useSWR(id ? `/api/startup/${id}/views` : null, fetcher, {
    fallbackData: { views: initialViews },
    revalidateOnFocus: true,
    revalidateOnMount: false,
    refreshInterval: isVisible ? dynamicRefresh : 0,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    dedupingInterval: REFRESH_INTERVAL,
    isPaused: () => !isVisible,
  });

  // Update refresh interval if views cross threshold
  useEffect(() => {
    const views = data?.views ?? initialViews;
    if (views > LIVE_VIEW_MAX_THRESHOLD && dynamicRefresh !== 0) {
      setDynamicRefresh(0);
    } else if (views <= LIVE_VIEW_MAX_THRESHOLD && dynamicRefresh === 0) {
      setDynamicRefresh(REFRESH_INTERVAL);
    }
  }, [data?.views, initialViews, dynamicRefresh]);

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

    if (!lastViewed || now - Number(lastViewed) > TWENTY_FOUR_HOURS) {
      localStorage.setItem(storageKey, now.toString());
      hasPostedRef.current = true;
      fetch(`/api/startup/${id}/views`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId }),
      })
        .then(async (res) => {
          if (res.ok) {
            const updatedData = await res.json();
            mutate(updatedData, false);
          } else {
            console.error('Error posting view:', res.statusText);
          }
        })
        .catch((error) => {
          console.error('Error posting view:', error);
        });
    }
  }, [id, mutate, incrementOnMount, isLoggedIn, toast]);

  const prevViews = useRef(data?.views ?? initialViews);
  useEffect(() => {
    if (data?.views !== undefined && prevViews.current !== data.views) {
      setAnimate(true);
      prevViews.current = data.views;
      const timeout = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timeout);
    } else if (data?.views === undefined && prevViews.current !== initialViews) {
      prevViews.current = initialViews;
    }
  }, [data?.views, initialViews]);

  const views = data?.views ?? initialViews;

  return (
    <Tooltip text={`${views} Views`}>
      <div ref={containerRef} className="flex cursor-default items-center gap-1">
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
