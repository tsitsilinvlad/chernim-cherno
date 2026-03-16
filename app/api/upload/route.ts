import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { parseWorkbook } from '@/lib/excel';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Файл не найден.' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const settings = await getSettings();

  try {
    const parsed = parseWorkbook(buffer, settings);
    await prisma.upload.create({
      data: {
        fileName: file.name,
        sheetName: parsed.sheetName,
        uploadedBy: session.user.email,
        items: {
          create: parsed.items.map((item) => ({
            name: item.name,
            price: item.price,
            lastSaleDate: item.lastSaleDate,
            lastDeliveryDate: item.lastDeliveryDate,
            daysInStock: item.daysInStock,
            soldUnits: item.soldUnits,
            stockLeft: item.stockLeft,
            turnoverPerDay: item.turnoverPerDay,
            stockDays: item.stockDays,
            selloutDate: item.selloutDate,
            idealOrder: item.idealOrder,
            status: item.status,
            stockLabel: item.stockLabel,
          })),
        },
      },
    });

    const uploads = await prisma.upload.findMany({
      orderBy: { uploadedAt: 'desc' },
      include: { items: { orderBy: { turnoverPerDay: 'desc' } } },
    });

    return NextResponse.json({ uploads });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ошибка импорта файла.' }, { status: 400 });
  }
}
