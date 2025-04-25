import { Squirrel } from 'lucide-react';
import SearchForm from '@/components/SearchForm';
import StartupCard from '@/components/StartupCard';
import { getStartups } from '@/lib/queries';
import { StartupCardType } from '@/components/StartupCard';

async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; sort?: string }>;
}) {
  const { query, sort } = await searchParams;
  const posts = await getStartups(query, sort);

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

        <form method="GET" className="mb-4 flex justify-end" action="#cards-section">
          <input type="hidden" name="query" value={query || ''} />
          <select
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
          <button type="submit" className="ml-2 rounded border px-2 py-1">
            Sort
          </button>
        </form>
        <ul className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {posts?.length > 0 ? (
            posts.map((post: StartupCardType) => <StartupCard key={post?._id} post={post} />)
          ) : (
            <p className="m-auto">
              <Squirrel /> No posts found
            </p>
          )}
        </ul>
      </section>
    </>
  );
}

export default Home;
