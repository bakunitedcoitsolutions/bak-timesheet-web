/**
 * Filter Utilities
 * Helper functions for parsing and managing filter parameters
 */

export interface FilterParams {
  designationId?: number;
  payrollSectionId?: number;
}

/**
 * Parse GroupDropdown selected value and return appropriate filter parameters
 * 
 * @param selectedFilter - The selected value from GroupDropdown (can be "all", "payroll-{id}", or "designation-{id}")
 * @returns FilterParams object with designationId and/or payrollSectionId set appropriately
 * 
 * @example
 * // When "all" is selected
 * parseGroupDropdownFilter("all") // { designationId: undefined, payrollSectionId: undefined }
 * 
 * // When a payroll section is selected
 * parseGroupDropdownFilter("payroll-5") // { designationId: undefined, payrollSectionId: 5 }
 * 
 * // When a designation is selected
 * parseGroupDropdownFilter("designation-3") // { designationId: 3, payrollSectionId: undefined }
 */
export const parseGroupDropdownFilter = (
  selectedFilter: string | number | null | undefined
): FilterParams => {
  // If "all" is selected or no filter, remove both filters
  if (!selectedFilter || selectedFilter === "all") {
    return {
      designationId: undefined,
      payrollSectionId: undefined,
    };
  }

  // Parse prefixed value
  if (typeof selectedFilter === "string") {
    // If it's a payroll section (prefix: "payroll-")
    // Remove designation filter and set payrollSectionId
    if (selectedFilter.startsWith("payroll-")) {
      const id = Number(selectedFilter.replace("payroll-", ""));
      if (!isNaN(id) && id > 0) {
        return {
          designationId: undefined, // Remove designation filter
          payrollSectionId: id, // Set payroll section filter
        };
      }
    }

    // If it's a designation (prefix: "designation-")
    // Remove payrollSection filter and set designationId
    if (selectedFilter.startsWith("designation-")) {
      const id = Number(selectedFilter.replace("designation-", ""));
      if (!isNaN(id) && id > 0) {
        return {
          designationId: id, // Set designation filter
          payrollSectionId: undefined, // Remove payroll section filter
        };
      }
    }
  }

  // If value doesn't match any pattern, remove both filters
  return {
    designationId: undefined,
    payrollSectionId: undefined,
  };
};
