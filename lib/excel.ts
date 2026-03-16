import * as XLSX from 'xlsx';
import { computeMetrics, detectColumn, type ThresholdSettings } from '@/lib/metrics';

export function parseWorkbook(buffer: Buffer, settings: ThresholdSettings) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
  if (!rows.length) throw new Error('Файл пустой или не удалось распознать строки.');

  const columns = Object.keys(rows[0]);
  const map = {
    name: detectColumn(columns, ['наименование', 'товар', 'название']),
    price: detectColumn(columns, ['стоимость', 'цена']),
    lastSaleDate: detectColumn(columns, ['дата последней продажи', 'последняя продажа']),
    lastDeliveryDate: detectColumn(columns, ['дата последней поставки', 'последняя поставка']),
    daysInStock: detectColumn(columns, ['наличие дней', 'дней']),
    soldUnits: detectColumn(columns, ['продано позиций', 'продано', 'кол-во продаж']),
    stockLeft: detectColumn(columns, ['остаток']),
    turnoverPerDay: detectColumn(columns, ['оборачиваемость рублей в день', 'рублей в день', '₽/день']),
    stockDays: detectColumn(columns, ['запас дней']),
    idealOrder: detectColumn(columns, ['идеальный заказ']),
  };

  if (!map.name) throw new Error('Не найден столбец с наименованием товара.');

  const items = rows
    .filter((row) => row[map.name!])
    .map((row) => computeMetrics({
      name: row[map.name!],
      price: map.price ? row[map.price] : null,
      lastSaleDate: map.lastSaleDate ? row[map.lastSaleDate] : null,
      lastDeliveryDate: map.lastDeliveryDate ? row[map.lastDeliveryDate] : null,
      daysInStock: map.daysInStock ? row[map.daysInStock] : null,
      soldUnits: map.soldUnits ? row[map.soldUnits] : null,
      stockLeft: map.stockLeft ? row[map.stockLeft] : null,
      turnoverPerDay: map.turnoverPerDay ? row[map.turnoverPerDay] : null,
      stockDays: map.stockDays ? row[map.stockDays] : null,
      idealOrder: map.idealOrder ? row[map.idealOrder] : null,
    }, settings))
    .filter((item) => item.name);

  return { sheetName, items };
}
