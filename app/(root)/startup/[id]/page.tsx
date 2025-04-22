import { notFound } from "next/navigation";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import markdownit from "markdown-it";
const md = markdownit({ html: true });

import { STARTUP_BY_ID } from "@/lib/queries";
import { formatDate, formatDateAgo } from "@/lib/utils";
import ShareButton from "@/components/ui/ShareButton";
import { View, ViewUpdate } from "@/components/View";
import Tooltip from "@/components/Tooltip";
import FeaturedStartups from "@/components/FeaturedStartups";
import { mongoFetch } from "@/lib/live";
import { ObjectId } from "mongodb";

// export const experimental_ppr = true;

async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  // Check if id is a valid ObjectId before querying DB
  if (!ObjectId.isValid(id)) return notFound();
  let post;

  try {
    const { data } = await mongoFetch({
      query: STARTUP_BY_ID,
      params: { id }
    });
    post = data;
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return notFound();
  }

  if (!post) return notFound();
  const parsedContent = md.render(post?.pitch || "");
  await ViewUpdate({ id });
  // lg:mx-28 my-4 mx-2
  return (
    <>
      <section className=" blueContainer flex flex-col px-8 py-4 ">
        <div className="max-w-[800px] justify-center m-auto">
          <div>
            {" "}
            <div className="flex justify-between gap-20 mx-6 md:mx-12 my-8">
              <Tooltip
                text={`Created: ${formatDateAgo(
                  post?.createdAt || new Date()
                )}`}
              >
                <p className="text-start">
                  {formatDate(post?.createdAt || new Date())}
                </p>
              </Tooltip>
              <div className="flex">
                <EyeIcon className="size-6 text-primary" />
                <span className="text-16-medium">
                  <Suspense fallback={<Skeleton className="view_skeleton" />}>
                    <View id={id} />
                  </Suspense>
                </span>
              </div>
            </div>{" "}
            <h1 className="textBox">{post?.title}</h1>{" "}
            <div className="mx-8 mt-8 lg:mx-32 text-start">
              <div
                className="prose dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h1:text-primary/90 prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-primary/80 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-p:text-base max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: md.render(post?.description || "")
                }}
              />
            </div>
          </div>
          <div className="author mx-12">
            <Tooltip text={post.author?.bio}>
              <Link
                className="flex justify-between gap-2"
                href={`/user/${post.author?.username}`}
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
        </div>
      </section>

      <section>
        <div className="mx-6 md:mx-20 lg:mx-32 my-6 md:my-12 flex justify-center flex-col items-center">
          {" "}
          <Image
            src={
              post.image && post.image.startsWith("http")
                ? post.image
                : `https://placehold.co/600x400?text=${encodeURIComponent(
                    post.title || "Startup"
                  )}`
            }
            width={600}
            height={400}
            alt={post?.title || "Startup image"}
            className="rounded-xl mb-8"
          />
          <div className="articleBox">
            {parsedContent ? (
              <div
                className=" max-w-[600px] justify-center "
                dangerouslySetInnerHTML={{ __html: parsedContent }}
              />
            ) : (
              <p>No details available</p>
            )}
          </div>
        </div>
      </section>
      <hr />

      <section>
        <FeaturedStartups />
      </section>
      <hr />

      <section>
        <div className="mx-6 md:mx-10 lg:mx-16 my-6 md:my-12 flex justify-center">
          <div className="articleBox">
            <h2 className="text-24-medium">Comments</h2>
            <p>Comments will be available soon</p>
          </div>
        </div>
      </section>
    </>
  );
}
//src={post.author?.image ? post.author.image : "/logo.png"}

export default Page;
