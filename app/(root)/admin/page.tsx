import { notFound } from 'next/navigation';
import { format } from 'date-fns';

import { auth } from '@/lib/auth';
import { getWeeklyStats, getMonthlyStats } from '@/lib/analytics';

const AdminPage = async () => {
  const session = await auth();
  if (!session || session.user?.role !== 'admin') {
    return notFound();
  }

  const weekly = await getWeeklyStats();
  const monthly = await getMonthlyStats();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>

      <section className="items-center justify-center py-10">
        <h2 className="pb-4 text-2xl">Weekly Stats</h2>
        <div>
          <div>
            <b>Startups created:</b> {weekly.startupCount}
          </div>
          <div>
            <b>New authors:</b> {weekly.authorCount}
          </div>
          <div>
            <b>New comments:</b> {weekly.commentsCount}
          </div>
          <div>
            <b>Week:</b> {format(weekly.weekStart, 'MMM d, yyyy')} -{' '}
            {format(weekly.weekEnd, 'MMM d, yyyy')}
          </div>
        </div>
      </section>

      <section className="items-center justify-center py-10">
        <h2 className="pb-4 text-2xl">Monthly Stats</h2>
        <div>
          <div>
            <b>Startups created:</b> {monthly.startupCount}
          </div>
          <div>
            <b>New authors:</b> {monthly.authorCount}
          </div>
          <div>
            <b>New comments:</b> {monthly.commentsCount}
          </div>
          <div>
            <b>Month:</b> {format(monthly.monthStart, 'MMM d, yyyy')} -{' '}
            {format(monthly.monthEnd, 'MMM d, yyyy')}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminPage;
