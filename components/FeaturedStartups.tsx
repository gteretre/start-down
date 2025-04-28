import React from 'react';
import { getDb } from '@/lib/mongodb';

import StartupCard from './StartupCard';

const FeaturedStartups = async () => {
  const db = await getDb();

  const slugs = [
    'quantum-procrastination',
    'ai-powered-cat-translator',
    'fomo-insurance',
    'passive-aggressive-roommate-bot',
    'sock-matcher-orphan-sock-dating-service',
    'forgetting-floss-a-dental-reminder-app',
  ];

  const editorPosts = await db
    .collection('startups')
    .aggregate([
      {
        $match: { slug: { $in: slugs } },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: 'authors',
          localField: 'author',
          foreignField: '_id',
          as: 'authorDetails',
        },
      },
      {
        $unwind: '$authorDetails',
      },
    ])
    .toArray();

  return editorPosts?.length > 0 ? (
    <div className="mx-auto w-full">
      <p className="text-30-semibold px-4">Featured Startups ({editorPosts.length})</p>
      <ul
        className="scroll-snap-x flex w-full gap-4 overflow-x-auto px-0 py-8"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {editorPosts.map((post, index: number) => (
          <StartupCard
            post={{
              ...post,
              _id: post._id.toString(),
              author: post.authorDetails,
            }}
            key={index}
            className="scroll-snap-align-start min-w-[300px] flex-1"
            style={{ scrollSnapAlign: 'start' }}
          />
        ))}
      </ul>
    </div>
  ) : (
    <p>No startups found...</p>
  );
};

export default FeaturedStartups;
