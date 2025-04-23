"use server";

import { auth } from "@/auth";
import { parseServerActionResponse, slugify } from "./utils";
import { getAuthorByUsername } from "@/lib/queries";
import { createStartup } from "@/lib/mutations";
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

  // Extract form data values
  const formEntries = Array.from(form.entries());

  const formData = Object.fromEntries(formEntries);
  const { title, description, category, link } = formData;

  if (!title || !description || !category || !pitch) {
    return parseServerActionResponse({
      error: "Missing required fields",
      status: "ERROR"
    });
  }

  const slug = slugify(title as string);

  try {
    const author = await getAuthorByUsername(session.user.username);

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

    if (!result || !result._id) {
      return parseServerActionResponse({
        error: "Failed to create startup",
        status: "ERROR"
      });
    }

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS"
    });
  } catch (error) {
    return parseServerActionResponse({
      error: typeof error === "object" ? JSON.stringify(error) : String(error),
      status: "ERROR"
    });
  }
};
