import { prisma } from '@/lib/prisma';

export const defaultSettings = {
  mustReallocateMin: 5000,
  maybeReallocateMin: 3000,
  keepMin: 1000,
  normalStockDays: 120,
  criticalStockDays: 365,
};

export async function getSettings() {
  const existing = await prisma.settings.findFirst();
  if (existing) return existing;
  return prisma.settings.create({ data: defaultSettings });
}
