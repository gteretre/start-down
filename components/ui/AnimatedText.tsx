'use client';
import React from 'react';

function AnimatedText({
  children,
  animation = 'typewriter',
}: {
  children: React.ReactNode;
  animation: string;
}) {
  return <div className={`${animation}`}>{children}</div>;
}

export default AnimatedText;
