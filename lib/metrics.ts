export type ThresholdSettings = {
  mustReallocateMin: number;
  maybeReallocateMin: number;
  keepMin: number;
  normalStockDays: number;
  criticalStockDays: number;
};

export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const cleaned = String(value)
    .replace(/\s/g, '')
    .replace(/₽/g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

export function excelDateToJSDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const utcDays = Math.floor(value - 25569);
    const utcValue = utcDays * 86400;
    return new Date(utcValue * 1000);
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeKey(key: string) {
  return String(key || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[ё]/g, 'е');
}

export function detectColumn(columns: string[], variants: string[]) {
  for (const variant of variants) {
    const match = columns.find((col) => normalizeKey(col).includes(normalizeKey(variant)));
    if (match) return match;
  }
  return null;
}

export function getStatus(turnoverPerDay: number, settings: ThresholdSettings) {
  if (turnoverPerDay >= settings.mustReallocateMin) return 'обязательно переразместить';
  if (turnoverPerDay >= settings.maybeReallocateMin) return 'возможно переразместить';
  if (turnoverPerDay >= settings.keepMin) return 'не переразмещать';
  return 'допродавать';
}

export function getStockLabel(stockDays: number | null, settings: ThresholdSettings) {
  if (stockDays === null || stockDays === undefined) return '—';
  if (stockDays > settings.criticalStockDays) return 'критическое затоваривание';
  if (stockDays > settings.normalStockDays) return 'затоваривание';
  return 'нормально';
}

export function computeMetrics(row: {
  name: unknown;
  price: unknown;
  lastSaleDate: unknown;
  lastDeliveryDate: unknown;
  daysInStock: unknown;
  soldUnits: unknown;
  stockLeft: unknown;
  turnoverPerDay: unknown;
  stockDays: unknown;
  idealOrder: unknown;
}, settings: ThresholdSettings) {
  const today = new Date();
  const price = parseNumber(row.price);
  const soldUnits = Math.round(parseNumber(row.soldUnits) ?? 0);
  const stockLeft = Math.round(parseNumber(row.stockLeft) ?? 0);

  let daysInStock = Math.round(parseNumber(row.daysInStock) ?? 0);
  const lastDeliveryDate = excelDateToJSDate(row.lastDeliveryDate);
  const lastSaleDate = excelDateToJSDate(row.lastSaleDate);

  if ((!daysInStock || daysInStock <= 0) && lastDeliveryDate) {
    const diffMs = today.getTime() - lastDeliveryDate.getTime();
    daysInStock = Math.max(1, Math.round(diffMs / 86400000));
  }
  if (!daysInStock || daysInStock <= 0) daysInStock = 1;

  const turnoverPerDay = parseNumber(row.turnoverPerDay) ?? ((soldUnits * (price ?? 0)) / daysInStock);
  const unitTurnoverPerDay = soldUnits / daysInStock;
  const stockDays = parseNumber(row.stockDays) ?? (unitTurnoverPerDay > 0 ? stockLeft / unitTurnoverPerDay : stockLeft > 0 ? 9999 : 0);
  const selloutDate = stockDays && Number.isFinite(stockDays)
    ? new Date(today.getTime() + Math.round(stockDays) * 86400000)
    : null;
  const idealOrder = Math.max(
    0,
    Math.round(parseNumber(row.idealOrder) ?? (settings.normalStockDays * unitTurnoverPerDay - stockLeft))
  );

  return {
    name: String(row.name || '').trim(),
    price,
    lastSaleDate,
    lastDeliveryDate,
    daysInStock,
    soldUnits,
    stockLeft,
    turnoverPerDay,
    stockDays,
    selloutDate,
    idealOrder,
    status: getStatus(turnoverPerDay, settings),
    stockLabel: getStockLabel(stockDays, settings),
  };
}
