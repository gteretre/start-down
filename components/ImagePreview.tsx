'use client';
import Image from 'next/image';
import React from 'react';

export default function ImagePreview({ src, alt, ...props }: { src: string; alt: string }) {
  const [valid, setValid] = React.useState(true);

  if (!src) {
    return (
      <span className="pointer-events-none select-none text-sm text-muted-foreground">
        Image preview area
      </span>
    );
  }

  return valid ? (
    <Image
      src={src}
      alt={alt}
      width={240}
      height={600}
      className="pointer-events-none max-h-full max-w-full select-none rounded object-contain"
      onError={() => setValid(false)}
      {...props}
    />
  ) : (
    <span className="pointer-events-none select-none text-sm text-muted-foreground">
      Image preview: Failed to load image
    </span>
  );
}
