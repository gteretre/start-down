import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
// import markdownit from "markdown-it";
// const md = markdownit({ html: true });

import { STARTUP_BY_ID } from "@/lib/queries";
import { formatDate, formatNumber } from "@/lib/utils";

async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  let post;

  try {
    post = await client.fetch(STARTUP_BY_ID, { id });
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return notFound();
  }

  if (!post) return notFound();
  // const parsedContent = md.render(post?.pitch || "");
  return (
    <>
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

      <section>
        <div className="mx-32 my-12">
          <Image
            src={
              post.image
                ? post.image
                : `https://placehold.co/600x400?text=${post.title}`
            }
            width={600}
            height={400}
            alt={post?.title}
            className="w-full h-auto rounded-xl"
          />
          <div className="space-y-5 mt-10 max-w-4xl mx-auto">
            <Link
              className="flex justify-between gap-5"
              href={`/user/${post.author?.id}`}
            >
              <Image
                src="/logo.png"
                alt={post.author?.name + "s avatar"}
                width={48}
                height={48}
              />
              <div className="flex flex-col items-start">
                <p className="text-24-medium">{post.author?.name}</p>
                <p className="text-16-medium">@{post.author?.username}</p>
              </div>
            </Link>
            <p className="category">{post.category}</p>
          </div>
          <h3 className="text-30-bold mt-10">Details</h3>
        </div>
      </section>
    </>
  );
}
//src={post.author?.image ? post.author.image : "/logo.png"}

export default Page;
