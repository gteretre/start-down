import React from 'react';
import { getFeaturedStartups } from '@/lib/queries';

import StartupCard from './StartupCard';

const FeaturedStartups = async () => {
  const slugs = [
    'quantum-procrastination',
    'ai-powered-cat-translator',
    'fomo-insurance',
    'passive-aggressive-roommate-bot',
    'sock-matcher-orphan-sock-dating-service',
    'forgetting-floss-a-dental-reminder-app',
  ];

  const startups = await getFeaturedStartups(slugs);

  return startups.length > 0 ? (
    <div className="mx-auto w-full">
      <p className="text-30-semibold px-4">Featured Startups ({startups.length})</p>
      <ul
        className="scroll-snap-x flex w-full gap-4 overflow-x-auto px-0 py-8"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {startups.map((post) => (
          <StartupCard post={post} key={post._id} />
        ))}
      </ul>
    </div>
  ) : (
    <p>No startups found...</p>
  );
};

export default FeaturedStartups;
