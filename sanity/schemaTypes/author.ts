import { defineType, defineField } from "sanity";
import { UserIcon } from "lucide-react";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "id",
      title: "ID",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "username",
      title: "Username",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text"
    })
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "username",
      media: "image"
    }
  }
});
