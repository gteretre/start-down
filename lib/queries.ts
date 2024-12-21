import { defineQuery } from "next-sanity";

export const STARTUPS_QUERY = defineQuery(
  `*[_type == "startup" && defined(slug.current) && (!defined($search) || 
    title match $search || title match $search + "*" || category match $search || category match $search + "*" || author->name match $search || author->name match $search + "*")
  ]
  | order(_createdAt desc) {
        _id,
        title,
        slug,
        _createdAt,
        author ->{
        _id, name, image, bio, username
        },
        views,
        description,
        category,
        image,
    }`
);

export const STARTUPS_BY_AUTHOR_QUERY = defineQuery(
  `*[_type == "startup" && author->username == $username]{
    _id,
    title,
    slug,
    _createdAt,
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

export const STARTUP_BY_ID = defineQuery(
  `*[_type == "startup" && _id == $id][0]{
    _id,
    title,
    slug,
    _createdAt,
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

export const PLAYLIST_BY_SLUG_QUERY = defineQuery(
  `*[_type == "playlist" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    select[]->{
      _id,
      _createdAt,
      title,
      slug,
      author ->{
    _id, name, image, bio, username
    },
      views,
      description,
      category,
      image,
      pitch
      }
    }
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
    id,
    name,
    username,
    bio,
    email,
    image,
    }`
);

export const AUTHOR_BY_DATA_ID_QUERY = defineQuery(
  `*[_type == "author" && _id == $id][0]{
    _id,
    id,
    name,
    username,
    bio,
    email,
    image,
    }`
);

export const AUTHOR_BY_EMAIL_QUERY = defineQuery(
  `*[_type == "author" && email == $email][0]{
    _id,
    id,
    name,
    username,
    bio,
    email,
    image,
    }`
);

export const AUTHOR_BY_USERNAME_QUERY = defineQuery(
  `*[_type == "author" && username == $username][0]{
    _id,
    id,
    name,
    username,
    bio,
    email,
    image,
    }`
);
