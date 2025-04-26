import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';

const AdminPage = async () => {
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    return notFound();
  }
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin panel. This is a protected page.</p>
      <p>Here you can manage settings, use experimental features, and check the debug data.</p>
    </main>
  );
};

export default AdminPage;
