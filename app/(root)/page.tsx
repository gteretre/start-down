import { Squirrel } from "lucide-react";
import { mongoFetch } from "@/lib/live";

import SearchForm from "@/components/SearchForm";
import StartupCard from "@/components/StartupCard";
import { STARTUPS_QUERY } from "@/lib/queries";
import { StartupCardType } from "@/components/StartupCard";

async function Home({
  searchParams
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const query = (await searchParams).query;
  const params = { search: query || null };
  const { data: posts } = await mongoFetch({ query: STARTUPS_QUERY, params });

  return (
    <>
      <section className="blueContainer items-center px-8 pb-12 pt-16">
        <div className="textBox">
          <h1>Bring Light to Your Misery</h1>
        </div>
        <br />
        <h3>
          Submit Stupid ideas, Vote on the Most Stupid One, and Get Bullied
        </h3>
        <SearchForm query={query} />
      </section>
      <section className="section-container">
        <p className="text-30-semibold text-center">
          {query ? `Search results for ${query}` : "Popular Startups"}
        </p>
        <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 lg:grid-cols-3 gap-4">
          {posts?.length > 0 ? (
            posts.map((post: StartupCardType) => (
              <StartupCard key={post?._id} post={post} />
            ))
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
