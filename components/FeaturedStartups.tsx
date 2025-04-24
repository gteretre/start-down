import React from 'react';
import { getDb } from '@/lib/mongodb';

import StartupCard from './StartupCard';

const FeaturedStartups = async () => {
  const db = await getDb();

  const slugs = ['quantum-procrastination', 'ai-powered-cat-translator'];

  const editorPosts = await db
    .collection('startups')
    .aggregate([
      {
        $match: { 'slug.current': { $in: slugs } },
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
    <div className="mx-auto max-w-4xl">
      <p className="text-30-semibold">Featured Startups ({editorPosts.length})</p>
      <ul className="mx-8 my-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {editorPosts.map((post, index: number) => (
          <StartupCard
            key={index}
            post={{
              ...post,
              _id: post._id.toString(),
              author: post.authorDetails,
            }}
          />
        ))}
      </ul>
    </div>
  ) : (
    <p>No startups found...</p>
  );
};

export default FeaturedStartups;
