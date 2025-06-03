import { Squirrel } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Image from 'next/image';

import SearchForm from '@/components/SearchForm';
import { getStartups, getStartupsCount, getMostViewedStartupThisWeek } from '@/lib/queries';
import type { Startup } from '@/lib/models';
import StartupListClientWrapper from '@/components/startup/StartupListClientWrapper';

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
  searchParams: Promise<{ query?: string; sort?: string; view?: string; page?: string }>;
}) {
  const { query, sort, view, page } = await searchParams;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const limit = isMobile ? 12 : 24;
  const pageNum = Math.max(1, parseInt(page || '1', 10));
  const posts: Startup[] = await getStartups(query, sort, pageNum, limit);
  const total = await getStartupsCount(query);
  const totalPages = Math.min(10, Math.ceil(total / limit));

  if (pageNum > totalPages && totalPages > 0) {
    const params = new URLSearchParams({
      ...(query ? { query } : {}),
      ...(sort ? { sort } : {}),
      ...(view ? { view } : {}),
      page: totalPages.toString(),
    });
    redirect(`?${params.toString()}#cards-section`);
  }

  const startupOfTheWeek: (Startup & { viewsThisWeek: number }) | null =
    await getMostViewedStartupThisWeek();

  const cardView: ViewKey = (
    ['card', 'small', 'list'].includes(view as string) ? view : 'card'
  ) as ViewKey;
  const { ulClass } = viewOptions[cardView];

  const subtexts = [
    'Where bad ideas go to become legendary failures. Submit your concept, and watch as the internet either elevates it to meme status or buries it six feet under. The audience decides.',
    'Share your wildest ideas, vote for the most outrageous, and let the community mock you mercilessly!',
    'A place for your democratizing, digitally-sustainable, super-scalable, industry-agnostic, blazingly-fast, cutting-edge, innovative, hyper-converged, synergistically-disruptive, whatever AI product idea',
  ];
  const rand = Math.random();
  const subtext = subtexts[Math.floor(rand * subtexts.length)];
  return (
    <>
      {' '}
      <section className="relative flex min-h-[80vh] flex-col-reverse items-center justify-between gap-16 overflow-hidden bg-gradient-to-br from-background via-background to-muted/10 px-6 pb-12 pt-24 md:min-h-[85vh] md:flex-row md:px-12 lg:gap-20 xl:px-16">
        <div className="absolute left-1/3 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

        {/* LEFT */}
        <div className="z-10 flex max-w-2xl flex-1 flex-col items-start justify-center space-y-10">
          <div className="space-y-6">
            {' '}
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              {' '}
              ✨ Yes, it will be AI-Powered in the future
            </div>
            <h1 className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-left text-5xl font-bold leading-tight tracking-tight text-transparent md:text-6xl lg:text-7xl">
              Bring light to{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Your Misery
              </span>
            </h1>
            <p className="max-w-xl text-left text-lg leading-relaxed text-muted-foreground md:text-xl">
              {subtext}
            </p>
          </div>
          <div className="w-full max-w-lg">
            <SearchForm query={query} />
          </div>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Live Voting</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Real Feedback</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              <span>Community Driven</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            {startupOfTheWeek ? (
              <div className="relative rounded-2xl border border-ring/50 p-8 backdrop-blur-sm">
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                    Startup of the week
                  </div>
                </div>

                <div className="mb-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/50">
                      <Image
                        src={startupOfTheWeek.image || '/icon.png'}
                        alt={startupOfTheWeek.title}
                        width={56}
                        height={56}
                        className="h-14 w-14 object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-lg font-semibold text-foreground">
                        {startupOfTheWeek.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{startupOfTheWeek.category}</p>
                    </div>
                  </div>

                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {startupOfTheWeek.description}
                  </p>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-primary/5 p-3 text-center">
                    <div className="text-lg font-bold text-foreground">
                      {startupOfTheWeek.viewsThisWeek}
                    </div>
                    <div className="text-xs text-muted-foreground">Views This Week</div>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-3 text-center">
                    <div className="text-lg font-bold text-foreground">
                      {startupOfTheWeek.views}
                    </div>{' '}
                    <div className="text-xs text-muted-foreground">Total Views</div>
                  </div>
                </div>
                <div className="mb-6 text-center text-sm text-muted-foreground">
                  Created by{' '}
                  <span className="font-medium text-foreground">
                    {startupOfTheWeek.author?.name ?? 'Unknown'}
                  </span>
                </div>

                <div className="text-center">
                  <Link
                    href={`/startup/${startupOfTheWeek.slug}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                  >
                    Explore Startup
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/50">
                <div className="text-center">
                  <Squirrel className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No featured startup this week</p>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    Check back soon for updates
                  </p>
                </div>
              </div>
            )}{' '}
          </div>{' '}
        </div>
      </section>
      <section className="section-container" id="cards-section">
        <div className="mb-12 text-center">
          <h2 className="mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            {query ? `Search results for "${query}"` : 'Discover Popular Startups'}
          </h2>{' '}
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {query
              ? `We found something for you. `
              : `You can search for the author, startup, category, keywords. `}
          </p>
        </div>

        <div className="mb-8 flex flex-col items-center justify-between gap-6 rounded-xl border bg-card/50 p-6 backdrop-blur-sm md:flex-row">
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-primary"></span>
              {posts.length} {posts.length === 1 ? 'Startup' : 'Startups'} Found
            </div>
          </div>

          <form method="GET" className="flex flex-wrap items-end gap-4" action="#cards-section">
            <input type="hidden" name="query" value={query || ''} />
            <div className="flex flex-col">
              <label htmlFor="sort" className="mb-2 text-sm font-medium text-foreground">
                Sort By
              </label>
              <select
                id="sort"
                name="sort"
                className="selector"
                defaultValue={sort || 'createdAt-desc'}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="views-desc">Most Views</option>
                <option value="views-asc">Least Views</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="view" className="mb-2 text-sm font-medium text-foreground">
                Layout
              </label>
              <select id="view" name="view" className="selector" defaultValue={cardView}>
                <option value="card">Card View</option>
                <option value="small">Compact</option>
                <option value="list">List View</option>
              </select>
            </div>
            <button type="submit" className="selector">
              Apply Filters
            </button>
          </form>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Squirrel className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">No Startups Found</h3>
            <p className="text-muted-foreground">
              {query
                ? `No results found for "${query}". Try adjusting your search terms.`
                : 'No startups available with this query. Be the first to submit one!'}
            </p>
          </div>
        ) : (
          <>
            <StartupListClientWrapper initialPosts={posts} ulClass={ulClass} viewType={cardView} />
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex gap-2" aria-label="Pagination">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <Link
                      key={idx}
                      href={`?${new URLSearchParams({
                        query: query || '',
                        sort: sort || '',
                        view: view || '',
                        page: (idx + 1).toString(),
                      }).toString()}#cards-section`}
                      className={`rounded px-3 py-1 ${
                        pageNum === idx + 1
                          ? 'bg-primary text-card'
                          : 'bg-muted text-foreground hover:bg-primary/10'
                      }`}
                    >
                      {idx + 1}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

export default Home;
