import { auth } from "@/auth";
import { AUTHOR_BY_ID_QUERY } from "@/lib/queries";
import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
// import "@/app/(root)/settings/profile/stars.css"; // Import the CSS file

const Page = async () => {
  const session = await auth();
  if (!session) {
    return notFound();
  }

  const user = await client.fetch(AUTHOR_BY_ID_QUERY, {
    id: session.user.id
  });
  if (!user) {
    return notFound();
  }

  return (
    <>
      <div className="blueContainer p-10">
        Hello, {user.name} this site is not yet implemented (:
      </div>
      <section className="stars relative">
        <div>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </section>
    </>
  );
};

export default Page;
