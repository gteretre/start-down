import { startOfWeek, endOfWeek } from 'date-fns';

import { getDb } from '@/lib/mongodb';

export async function getStartupCountInPeriod(start: Date, end: Date) {
  const db = await getDb();
  return db.collection('startups').countDocuments({
    createdAt: { $gte: start, $lte: end },
  });
}

export async function getAuthorCountInPeriod(start: Date, end: Date) {
  const db = await getDb();
  return db.collection('authors').countDocuments({
    createdAt: { $gte: start, $lte: end },
  });
}

export async function getCommentsCountInPeriod(start: Date, end: Date) {
  const db = await getDb();
  return db.collection('comments').countDocuments({
    createdAt: { $gte: start, $lte: end },
  });
}

export async function getWeeklyStats() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const startupCount = await getStartupCountInPeriod(weekStart, weekEnd);
  const authorCount = await getAuthorCountInPeriod(weekStart, weekEnd);
  const commentsCount = await getCommentsCountInPeriod(weekStart, weekEnd);
  return { startupCount, authorCount, commentsCount, weekStart, weekEnd };
}

export async function getMonthlyStats() {
  const now = new Date();
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthEnd = now;
  const startupCount = await getStartupCountInPeriod(monthStart, monthEnd);
  const authorCount = await getAuthorCountInPeriod(monthStart, monthEnd);
  const commentsCount = await getCommentsCountInPeriod(monthStart, monthEnd);
  return { startupCount, authorCount, commentsCount, monthStart, monthEnd };
}
