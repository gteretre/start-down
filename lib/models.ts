import { ObjectId } from 'mongodb';

export interface Author {
  _id: string; //  ObjectId as string
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: Date;
  image?: string;
  bio?: string;
}

export interface Startup {
  _id: string; //  ObjectId as string
  title: string;
  slug: {
    current: string;
  };
  createdAt: Date;
  author: ObjectId;
  views: number;
  description: string;
  category: string;
  image?: string;
  pitch: string;
}
