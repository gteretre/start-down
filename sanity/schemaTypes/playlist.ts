import { defineField, defineType } from "sanity";

export const playlist = defineType({
  name: "playlist",
  title: "Playlists",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string"
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug"
    }),
    defineField({
      name: "select",
      title: "Select Startups",
      type: "array",
      of: [{ type: "reference", to: [{ type: "startup" }] }]
    })
  ]
});
