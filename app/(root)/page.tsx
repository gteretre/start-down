import SearchForm from "@/components/SearchForm";
import StartupCard from "@/components/StartupCard";

async function Home({
  searchParams
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const posts = [
    {
      _createdAt: new Date(),
      views: -1,
      author: { _id: 1, name: "The Founding Father" },
      _id: 1,
      description: "This is a description",
      image: "https://placehold.co/600x400?text=Startup+1",
      category: "This is a category",
      title: "This is a title"
    },
    {
      _createdAt: new Date(),
      views: -1,
      author: { _id: 1, name: "The Founding Father" },
      _id: 2,
      description: "This is a description",
      image: "https://placehold.co/600x400?text=Startup+2",
      category: "This is a category",
      title: "This is a title"
    }
  ];
  const { query } = await searchParams;
  return (
    <>
      <section className="blueContainer">
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
        <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts?.length > 0 ? (
            posts.map((post: StartupCardType) => (
              <StartupCard key={post?._id} post={post} />
            ))
          ) : (
            <p className="no-results">No posts found</p>
          )}
        </ul>
      </section>
    </>
  );
}

export default Home;
