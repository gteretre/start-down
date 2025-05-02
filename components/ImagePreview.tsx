import Image from 'next/image';
import React from 'react';

export default function ImagePreview({ src, alt, ...props }: { src: string; alt: string }) {
  const [valid, setValid] = React.useState(true);

  React.useEffect(() => {
    if (!src) return setValid(false);
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => !cancelled && setValid(true);
    img.onerror = () => !cancelled && setValid(false);
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!src) {
    return (
      <span className="pointer-events-none select-none text-sm text-muted-foreground">
        Image preview area
      </span>
    );
  }

  if (!valid) {
    return (
      <span className="pointer-events-none select-none text-sm text-muted-foreground">
        Image preview: Failed to load image
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={160}
      height={160}
      className="pointer-events-none max-h-full max-w-full select-none rounded object-contain"
      {...props}
    />
  );
}
