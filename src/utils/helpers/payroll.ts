/**
 * Checks if a payroll section ID corresponds to "Truck House" (6) or "OS Truck House" (15) or "TH, Al Barkah" (21) or "TH, Establishments" (22).
 * @param payrollSectionId - The payroll section ID to check
 * @returns boolean indicating if it is a truck or house section
 */
export const isTruckHouseSection = (
  payrollSectionId: number | null | undefined
): boolean => {
  return (
    payrollSectionId === 6 ||
    payrollSectionId === 15 ||
    payrollSectionId === 21 ||
    payrollSectionId === 22
  );
};
