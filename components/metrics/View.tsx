'use client';
import { formatNumber } from '@/lib/utils';
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
    prevViews.current = views;
  }, [views]);

  return (
    <div className="flex items-center gap-1">
      <EyeIcon className="size-6 text-primary" />
      <span className="text-16 weight-semibold text-primary">
        <span className={`flex ${animate ? 'view-update-animate' : ''} w-[3ch]`}>
          {formatNumber(views)}
        </span>
      </span>
    </div>
  );
};

export default View;
