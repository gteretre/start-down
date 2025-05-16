import { ObjectId } from 'mongodb';

export interface Author {
  _id: string;
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: Date;
  provider: string;
  image?: string;
  bio?: string;
  role?: string;
}

export interface Startup {
  _id: string;
  title: string;
  slug: string;
  createdAt: Date;
  author: Author;
  views: number;
  description: string;
  category: string;
  image?: string;
  pitch: string;
  likes: number;
  userLikes?: string[];
}

export interface Comment {
  _id: string;
  author: Author;
  createdAt: Date;
  upvotes: number;
  userUpvotes: string[];
  text: string;
  startupId: string;
  parentId?: string;
  editedAt?: Date;
}

export type RawAuthor = {
  _id: string | ObjectId;
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  createdAt?: Date | string;
  image?: string;
  bio?: string;
  role?: string;
  provider: string;
};

export type RawStartup = {
  _id: string | ObjectId;
  title?: string;
  slug?: string;
  createdAt?: Date | string;
  author: RawAuthor;
  views?: number;
  description?: string;
  category?: string;
  image?: string;
  pitch?: string;
  likes?: number;
  userLikes?: (string | ObjectId)[];
};

export type RawComment = {
  _id: string | ObjectId;
  author: string | ObjectId;
  createdAt?: Date | string;
  upvotes?: number;
  text?: string;
  startupId: string;
  parentId?: string;
  editedAt?: Date | string;
  userUpvotes?: string[];
};

export interface ToastType {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  [key: string]: unknown;
}
