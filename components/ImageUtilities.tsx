'use client';
import { allowedImageDomains } from '@/lib/allowedDomains';
import Image from 'next/image';
import React from 'react';

export function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    return allowedImageDomains.some((domain) => {
      if (typeof domain === 'string') {
        return hostname === domain || hostname.endsWith('.' + domain);
      } else if (domain instanceof RegExp) {
        return domain.test(hostname);
      }
      return false;
    });
  } catch {
    return false;
  }
}

export function getSafeImageUrl(src: string | undefined, fallback: string): string {
  if (src && isAllowedImageUrl(src)) {
    return src;
  }
  return fallback;
}

export function ProfilePicture({
  src,
  alt = 'Profile picture',
  width = 240,
  height = 240,
  className = 'avatar',
}: {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'inline-block',
      }}
      className={className}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      />
    </div>
  );
}

interface ImagePreviewProps extends React.ComponentPropsWithoutRef<'img'> {
  src: string | undefined;
  alt: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  className?: string;
  onImageLoadStatusChange?: (status: string) => void;
}

export function ImagePreview({
  src,
  alt = 'Image preview',
  width = 240,
  height = 600,
  className = '',
  onImageLoadStatusChange,
  ...props
}: ImagePreviewProps) {
  type ImageStatus =
    | 'no-src'
    | 'loading'
    | 'loaded'
    | 'error-domain'
    | 'error-timeout'
    | 'error-load';

  const [imageStatus, setImageStatus] = React.useState<ImageStatus>(src ? 'loading' : 'no-src');
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastSrcRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (lastSrcRef.current === src) return;
    lastSrcRef.current = src;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!src) {
      setImageStatus('no-src');
      onImageLoadStatusChange?.('no-src');
      return;
    }

    if (!isAllowedImageUrl(src)) {
      setImageStatus('error-domain');
      onImageLoadStatusChange?.('error-domain');
      return;
    }

    setImageStatus('loading');
    onImageLoadStatusChange?.('loading');

    timeoutRef.current = setTimeout(() => {
      setImageStatus((currentStatus) => {
        if (currentStatus === 'loading') {
          onImageLoadStatusChange?.('error-timeout');
          return 'error-timeout';
        }
        return currentStatus;
      });
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [src, onImageLoadStatusChange]);

  const handleLoad = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setImageStatus('loaded');
    onImageLoadStatusChange?.('loaded');
  }, [onImageLoadStatusChange]);

  const handleError = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setImageStatus('error-load');
    onImageLoadStatusChange?.('error-load');
  }, [onImageLoadStatusChange]);

  if (imageStatus === 'no-src') {
    return (
      <span className="pointer-events-none select-none text-sm text-muted-foreground">
        Image preview area
      </span>
    );
  }

  if (imageStatus === 'error-domain') {
    return (
      <span className="pointer-events-none select-none text-sm text-muted-foreground">
        Image preview: Domain not allowed. Provided URL may be unsafe.
      </span>
    );
  }

  if (imageStatus === 'error-timeout') {
    return (
      <span className="pointer-events-none select-none text-sm text-muted-foreground">
        Image preview: Timed out loading image. Provided URL may be incorrect.
      </span>
    );
  }

  if (imageStatus === 'error-load') {
    return (
      <span className="pointer-events-none select-none text-sm text-muted-foreground">
        Image preview: Failed to load image. Provided URL may be incorrect.
      </span>
    );
  }

  if (imageStatus === 'loading' || imageStatus === 'loaded') {
    return (
      <Image
        key={src}
        src={src as string}
        alt={alt}
        width={width}
        height={height}
        className={`pointer-events-none max-h-full max-w-full select-none rounded object-contain ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    );
  }
}
