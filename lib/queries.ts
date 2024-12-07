import { defineQuery } from "next-sanity";

export const STARTUPS_QUERY = defineQuery(
  `*[_type == "startup" && defined(slug.current) && (!defined($search) || 
    title match $search || title match $search + "*" || category match $search || category match $search + "*" || author->name match $search || author->name match $search + "*")
  ]
  | order(createdAt desc) {
        _id,
        title,
        slug,
        createdAt,
        author ->{
        _id, name, image, bio, username
        },
        views,
        description,
        category,
        image,
    }`
);

export const STARTUP_BY_ID = defineQuery(
  `*[_type == "startup" && _id == $id][0]{
    _id,
    title,
    slug,
    createdAt,
    author ->{
    _id, name, image, bio, username
    },
    views,
    description,
    category,
    image,
    pitch
}`
);

export const STARTUP_VIEWS_QUERY = defineQuery(
  `*[_type == "startup" && _id == $id][0]{
    _id,views 
    }`
);

export const AUTHOR_BY_ID_QUERY = defineQuery(
  `*[_type == "author" && _id == $id][0]{
    _id,
    name,
    username,
    bio,
    email,
    image,
    bio
    }`
);
