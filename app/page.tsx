import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import DashboardClient from '@/components/dashboard-client';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  const uploads = await prisma.upload.findMany({
    orderBy: { uploadedAt: 'desc' },
    include: { items: { orderBy: { turnoverPerDay: 'desc' } } },
  });
  const settings = await getSettings();

  return (
    <DashboardClient
      initialUploads={uploads as any}
      initialSettings={settings as any}
      userEmail={session.user.email}
      userRole={(session.user as any).role || 'employee'}
    />
  );
}
