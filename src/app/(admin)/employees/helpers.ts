import { DataTableFilterMeta } from "primereact/datatable";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";
import { GlobalDataGeneral, GlobalDataDesignation } from "@/context/GlobalDataContext";

/**
 * Maps employee data with designation and payroll section names from global data
 */
export const getModifiedEmployeesData = (
  employees: ListedEmployee[],
  designations: GlobalDataDesignation[],
  payrollSections: GlobalDataGeneral[]
) => {
  return employees.map((employee: ListedEmployee) => {
    const designation = designations.find(
      (d) => d.id === employee.designationId
    );
    const payrollSection = payrollSections.find(
      (p) => p.id === employee.payrollSectionId
    );
    return {
      ...employee,
      designationName: designation?.nameEn,
      payrollSectionName: payrollSection?.nameEn,
    };
  });
};

/**
 * Parses PrimeReact DataTable filters into a simple key-value record
 */
export const parseDataTableFilters = (filters: DataTableFilterMeta): Record<string, string> => {
  const newFilters: Record<string, string> = {};

  Object.entries(filters).forEach(([field, filterMeta]) => {
    // Skip global filter
    if (field === "global") return;

    // Handle different filter meta structures
    const meta = filterMeta as any;
    if (meta && meta.value) {
      newFilters[field] = meta.value;
    }
  });

  return newFilters;
};
