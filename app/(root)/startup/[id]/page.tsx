import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";

import { STARTUP_BY_ID } from "@/lib/queries";

import { formatDate } from "@/lib/utils";

async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  let post;

  try {
    post = await client.fetch(STARTUP_BY_ID, { id });
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return notFound();
  }

  if (!post) return notFound();
  return (
    <div>
      <section className="blueContainer">
        <p className="tag m-4">{formatDate(post?._createdAt || new Date())}</p>
        <h1 className="textBox !min-h-{230px} !min-h-{460px}">{post?.title}</h1>
        <p className="m-4">{post?.description}</p>
      </section>
    </div>
  );
}

export default Page;
