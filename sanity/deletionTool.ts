"use server";
import { writeClient } from "@/sanity/lib/write-client";

function clearAuthor() {
  console.log("Clearing image fields for all authors...");
  writeClient
    .patch({ query: '*[_type == "author"]' })
    .set({ image: null })
    .commit()
    .then(() => {
      console.log("Image fields set to null successfully.");
    })
    .catch((error) => {
      if (error.message.includes("Insufficient permissions")) {
        console.error(
          "Error: Insufficient permissions. Please check your client permissions."
        );
      } else {
        console.error(error);
      }
    });
}

export default clearAuthor;
