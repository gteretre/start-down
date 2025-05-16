import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Author, Startup } from './models'; // Import types

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateAgo(date: string) {
  const diff = new Date().getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    if (hours === 0) return 'Just now';
    return `${hours} hours ago`;
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} weeks ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months ago`;

  const years = Math.floor(days / 365);
  return `${years} years ago`;
}

export function formatNumber(num: number) {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function parseServerActionResponse<T>(response: T) {
  return JSON.parse(JSON.stringify(response));
}

export function generateRandomString(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function slugify(title: string, checkSlugExists: (slug: string) => Promise<boolean>) {
  const baseSlug = title
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  let slug = baseSlug;
  let attempt = 0;
  while (await checkSlugExists(slug)) {
    slug = `${baseSlug}-${generateRandomString(10)}`;
    attempt++;
    if (attempt > 5) break; // avoid infinite loop
  }
  return slug;
}

export function getAuthorImage(author: Author | null | undefined): string {
  if (!author || typeof author !== 'object') return '/logo.png';
  const image = author.image;
  if (typeof image === 'string' && (image.startsWith('http') || image.startsWith('/'))) {
    return image;
  }
  return '/logo.png';
}

export function getStartupImage(post: Startup | null | undefined): string {
  if (!post || typeof post !== 'object') return 'https://placehold.co/600x400?text=Startup+Image';
  const image = post.image;
  const title = typeof post.title === 'string' && post.title.trim() ? post.title : 'Startup Image';
  if (typeof image === 'string' && (image.startsWith('http') || image.startsWith('/'))) {
    return image;
  }
  return `https://placehold.co/600x400?text=${encodeURIComponent(title)}`;
}
