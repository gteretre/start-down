'use client';
import { formatNumber } from '@/lib/utils';
import Tooltip from './Tooltip';
import { EyeIcon } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

const View = ({ views }: { views: number }) => {
  const prevViews = useRef(views);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (prevViews.current !== views) {
      setAnimate(true);
      prevViews.current = views;
      const timeout = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timeout);
    }
    // Update ref even if views haven't changed, in case component re-renders
    prevViews.current = views;
  }, [views]);

  return (
    <Tooltip text={`${formatNumber(views)} Views`}>
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
