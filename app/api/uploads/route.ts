import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const uploads = await prisma.upload.findMany({
    orderBy: { uploadedAt: 'desc' },
    include: { items: { orderBy: { turnoverPerDay: 'desc' } } },
  });
  return NextResponse.json({ uploads });
}
