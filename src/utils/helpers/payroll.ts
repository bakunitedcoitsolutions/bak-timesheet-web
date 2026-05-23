/**
 * Checks if a payroll section ID corresponds to "Truck" (6) or "House" (15).
 * @param payrollSectionId - The payroll section ID to check
 * @returns boolean indicating if it is a truck or house section
 */
export const isTruckHouseSection = (
  payrollSectionId: number | null | undefined
): boolean => {
  return payrollSectionId === 6 || payrollSectionId === 15;
};
