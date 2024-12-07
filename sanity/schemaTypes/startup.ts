import { defineType, defineField } from "sanity";
import { UserIcon } from "lucide-react";

export const startup = defineType({
  name: "startup",
  title: "Startup",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      validation: (Rule) => Rule.required(),
      options: {
        source: "title",
        maxLength: 96
      }
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "views",
      title: "Views",
      type: "number"
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      validation: (Rule) =>
        Rule.min(1)
          .max(5)
          .required()
          .error("Please select at least one category"),
      options: {
        list: [
          { title: "Tech", value: "tech" },
          { title: "AI", value: "AI" },
          { title: "Health", value: "health" },
          { title: "Finance", value: "finance" },
          { title: "Other", value: "other" }
        ]
      }
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "url"
    }),
    defineField({
      name: "pitch",
      title: "Pitch",
      type: "markdown",
      validation: (Rule) => Rule.required()
    })
  ]
});
