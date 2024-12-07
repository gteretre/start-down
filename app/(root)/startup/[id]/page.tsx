import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import markdownit from "markdown-it";
const md = markdownit({ html: true });

import { STARTUP_BY_ID } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import ShareButton from "@/components/ui/ShareButton";
import { View, ViewUpdate } from "@/components/View";
import Tooltip from "@/components/Tooltip";

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
  const parsedContent = md.render(post?.pitch || "");
  ViewUpdate({ id });
  return (
    <>
      <section className=" blueContainer flex flex-col">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex justify-between gap-20 mx-12 my-8 lg:mx-32">
            <Tooltip
              text={
                Math.floor(
                  (new Date().getTime() -
                    new Date(post?._createdAt || new Date()).getTime()) /
                    (1000 * 60 * 60 * 24)
                ) === 0
                  ? "Created Today"
                  : `Created ${Math.floor(
                      (new Date().getTime() -
                        new Date(post?._createdAt || new Date()).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} days ago`
              }
            >
              <p>{formatDate(post?._createdAt || new Date())}</p>
            </Tooltip>
            <div className="flex gap-1">
              <EyeIcon className="size-6 text-primary" />
              <span className="text-16-medium">
                <Suspense fallback={<Skeleton className="view_skeleton" />}>
                  <View id={id} />
                </Suspense>
              </span>
            </div>
          </div>

          <h1 className="textBox mx-28 my-4 ">{post?.title}</h1>
          <p className="mx-8 mt-8 lg:mx-32 text-start justify-start">
            {post?.description}
          </p>
        </div>
        <div className="author mx-12">
          <Tooltip text={post.author?.bio}>
            <Link
              className="flex justify-between gap-2"
              href={`/user/${post.author?.id}`}
            >
              <Image
                src="/logo.png"
                alt={post.author?.name + "s avatar"}
                width={48}
                height={48}
                className="avatar"
              />
              <div className="flex flex-col items-start pt-1">
                <p className="text-24-medium">
                  <strong>{post.author?.name}</strong>
                </p>
                <p className="text-16-medium">@{post.author?.username}</p>
              </div>
            </Link>
          </Tooltip>
          <ShareButton
            title={post?.title || "Default Title"}
            text={post?.description || "Default Text"}
            url={"/startup/" + post?._id}
          />
        </div>
        <p className="category text-end text-sm mx-12">{post.category}</p>
      </section>

      <section>
        <div className="mx-32 my-12 flex justify-center flex-col items-center">
          <Image
            src={
              post.image
                ? post.image
                : `https://placehold.co/600x400?text=${post.title}`
            }
            width={600}
            height={400}
            alt={post?.title}
            className="rounded-xl mb-8"
          />
          {parsedContent ? (
            <div
              className="textBox prose"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
          ) : (
            <p>No details available</p>
          )}
        </div>
      </section>
      <section></section>
    </>
  );
}
//src={post.author?.image ? post.author.image : "/logo.png"}

export default Page;
