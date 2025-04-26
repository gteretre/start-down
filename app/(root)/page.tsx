import { Squirrel } from 'lucide-react';
import SearchForm from '@/components/SearchForm';
import { getStartups } from '@/lib/queries';
import type { Startup } from '@/lib/models';
import StartupListClientWrapper from '@/components/StartupListClientWrapper'; // Import the wrapper

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

  return (
    <>
      <section className="blueContainer items-center px-8 pb-12 pt-16">
        <div className="textBox">
          <h1 className="animated-heading">Bring Light to Your Misery</h1>
        </div>
        <br />
        <h3>Submit Stupid ideas, Vote on the Most Stupid One, and Get Bullied</h3>
        <SearchForm query={query} />
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
          <StartupListClientWrapper
            initialPosts={posts}
            ulClass={ulClass} // ulClass might not be used by list view, but pass it anyway
            viewType={cardView}
          />
        )}
      </section>
    </>
  );
}

export default Home;
