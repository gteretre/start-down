"use server";

import { auth } from "@/auth";
import { parseServerActionResponse, slugify } from "./utils";
import { createStartup, getAuthorById } from "./mongodb-service";

export const createPitch = async (
  state: any,
  form: FormData,
  pitch: string
) => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR"
    });
  }

  const { title, description, category, link } = Object.fromEntries(
    Array.from(form).filter(([key]) => key != pitch)
  );
  const slug = slugify(title as string);

  try {
    // Get the author from MongoDB
    const author = await getAuthorById(session.user.id);
    if (!author) {
      return parseServerActionResponse({
        error: "Author not found",
        status: "ERROR"
      });
    }

    const startup = {
      title,
      description,
      category,
      image: link,
      slug: { current: slug },
      author: author._id, // Use the MongoDB ObjectId reference
      pitch
    };

    const result = await createStartup(startup);
    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS"
    });
  } catch (error) {
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "ERROR"
    });
  }
};
