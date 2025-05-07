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

export interface ToastType {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  [key: string]: unknown;
}
