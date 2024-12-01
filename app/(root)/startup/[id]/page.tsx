import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import { EyeIcon } from "lucide-react";

import { STARTUP_BY_ID } from "@/lib/queries";
import { formatDate, formatNumber } from "@/lib/utils";

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
    <section className=" blueContainer flex flex-col items-center">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex justify-between gap-20 mx-12 my-8 lg:mx-32">
          <p>{formatDate(post?._createdAt || new Date())}</p>
          <div className="flex gap-1">
            <EyeIcon className="size-6 text-primary" />
            <span className="text-16-medium">
              {formatNumber(post.views || 1)}
            </span>
          </div>
        </div>

        <h1 className="textBox mx-28 my-4 ">{post?.title}</h1>
        <p className="m-8 lg:mx-32">{post?.description}</p>
      </div>
    </section>
  );
}

export default Page;
