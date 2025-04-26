export interface Author {
  _id: string;
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: Date;
  image?: string;
  bio?: string;
  role?: string;
}

export interface Startup {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  createdAt: Date;
  author: Author;
  views: number;
  description: string;
  category: string;
  image?: string;
  pitch: string;
}
