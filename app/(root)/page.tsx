import Image from 'next/image';

import { Squirrel } from 'lucide-react';
import SearchForm from '@/components/SearchForm';
import { getStartups } from '@/lib/queries';
import type { Startup } from '@/lib/models';
import StartupListClientWrapper from '@/components/startup/StartupListClientWrapper'; // Import the wrapper

const viewOptions = {
  card: {
    ulClass: 'mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
  },
  small: {
    ulClass:
      'mt-7 grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6',
  },
  list: {
    ulClass: 'mt-7 flex flex-col gap-4',
  },
};

type ViewKey = keyof typeof viewOptions;

async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; sort?: string; view?: string }>;
}) {
  const { query, sort, view } = await searchParams;
  const posts: Startup[] = await getStartups(query, sort);
  const cardView: ViewKey = (
    ['card', 'small', 'list'].includes(view as string) ? view : 'card'
  ) as ViewKey;
  const { ulClass } = viewOptions[cardView];
  const subtexts = [
    'Where bad ideas go to become legendary failures. Submit your concept, and watch as the internet either elevates it to meme status or buries it six feet under. The audience decides.',
    'Share your wildest ideas, vote for the most outrageous, and let the community mock you mercilessly!',
  ];
  const weights = [0.75, 0.25];
  const rand = Math.random();
  const subtext = rand < weights[0] ? subtexts[0] : subtexts[1];

  return (
    <>
      <section className="relative flex min-h-[60vh] flex-col-reverse items-center justify-between gap-10 overflow-hidden px-8 pb-16 pt-20 md:flex-row">
        <div className="z-10 flex max-w-xl flex-1 flex-col items-start justify-center gap-7">
          <h1 className="animated-heading mb-2 text-left text-5xl font-extrabold leading-tight tracking-tight text-primary drop-shadow-lg md:text-6xl">
            Bring Light to Your Misery
          </h1>
          <h3 className="mb-2 text-left text-xl font-medium text-muted-foreground md:text-2xl">
            {subtext}
          </h3>
          <div className="mt-2 w-full max-w-md">
            <SearchForm query={query} />
          </div>
        </div>
        <div className="relative hidden h-72 w-full flex-1 items-center justify-center md:flex md:h-96">
          <div className="absolute inset-0 scale-110 rounded-3xl bg-gradient-to-br from-blue-400 via-blue-200 to-transparent opacity-60 blur-2xl" />
          <div className="relative z-10 flex items-center justify-center lg:h-[400px] lg:w-[400px]">
            <Image
              src="/mainpageimage.jpg"
              alt="Main page illustration"
              width={400}
              height={400}
              className="rounded-3xl shadow-primary-foreground saturate-50 transition-all duration-700 ease-in-out hover:saturate-100"
              draggable={false}
            />
          </div>
        </div>
      </section>
      <section className="section-container" id="cards-section">
        <p className="text-30-semibold text-center">
          {query ? `Search results for ${query}` : 'Popular Startups'}
        </p>
        <form
          method="GET"
          className="mb-4 flex flex-wrap items-center justify-end gap-4"
          action="#cards-section"
        >
          <input type="hidden" name="query" value={query || ''} />
          <div className="flex flex-col">
            <label htmlFor="sort" className="mb-1 text-xs text-muted-foreground">
              Sort By
            </label>
            <select
              id="sort"
              name="sort"
              className="rounded border bg-background px-2 py-1 text-foreground"
              defaultValue={sort || 'createdAt-desc'}
            >
              <option value="createdAt-desc">Newest</option>
              <option value="createdAt-asc">Oldest</option>
              <option value="views-desc">Most Views</option>
              <option value="views-asc">Least Views</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="view" className="mb-1 text-xs text-muted-foreground">
              View (Experimental)
            </label>
            <select
              id="view"
              name="view"
              className="rounded border bg-background px-2 py-1 text-foreground"
              defaultValue={cardView}
            >
              <option value="card">Card</option>
              <option value="small">Compact</option>
              <option value="list">List</option>
            </select>
          </div>
          <button type="submit" className="self-end rounded border px-2 py-1">
            Apply
          </button>
        </form>
        {posts.length === 0 ? (
          <p className="m-auto">
            <Squirrel /> No posts found
          </p>
        ) : (
          <StartupListClientWrapper initialPosts={posts} ulClass={ulClass} viewType={cardView} />
        )}
      </section>
    </>
  );
}

export default Home;
