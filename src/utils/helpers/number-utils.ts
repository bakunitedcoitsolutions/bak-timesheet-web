/**
 * Format a number for display:
 * - Whole numbers are shown without decimals (e.g. 100 → "100")
 * - Fractional numbers are shown with up to `decimalPlaces` decimal places
 *   (default: 1), with trailing zeros stripped (e.g. 83.3 → "83.3")
 */
export const formatNum = (
  val: number | string | null | undefined,
  decimalPlaces = 1
): string => {
  const n = Number(val ?? 0);
  if (isNaN(n)) return "0";
  return n % 1 === 0 ? n.toString() : n.toFixed(decimalPlaces);
};
