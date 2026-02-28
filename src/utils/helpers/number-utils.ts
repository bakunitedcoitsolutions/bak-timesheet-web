/**
 * Format a number for display.
 * - Default: no decimal places (suited for Int monetary fields, e.g. salary, allowances).
 * - For Decimal fields like hourlyRate, pass decimalPlaces = 2 explicitly.
 * - Whole numbers never show trailing zeros.
 * - Fractional numbers are rounded to `decimalPlaces` digits.
 */
export const formatNum = (
  val: number | string | null | undefined,
  decimalPlaces = 0
): string => {
  const n = Number(val ?? 0);
  if (isNaN(n)) return "0";
  if (decimalPlaces === 0) return Math.round(n).toString();
  return n % 1 === 0 ? n.toString() : n.toFixed(decimalPlaces);
};
