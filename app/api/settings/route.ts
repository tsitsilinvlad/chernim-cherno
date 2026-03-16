import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role !== 'owner') {
    return NextResponse.json({ error: 'Только owner может менять настройки.' }, { status: 403 });
  }

  const body = await request.json();
  const current = await getSettings();
  const settings = await prisma.settings.update({
    where: { id: current.id },
    data: {
      mustReallocateMin: Number(body.mustReallocateMin) || current.mustReallocateMin,
      maybeReallocateMin: Number(body.maybeReallocateMin) || current.maybeReallocateMin,
      keepMin: Number(body.keepMin) || current.keepMin,
      normalStockDays: Number(body.normalStockDays) || current.normalStockDays,
      criticalStockDays: Number(body.criticalStockDays) || current.criticalStockDays,
    },
  });

  return NextResponse.json({ settings });
}
