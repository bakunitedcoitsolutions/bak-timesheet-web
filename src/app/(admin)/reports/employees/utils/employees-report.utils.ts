import dayjs from "@/lib/dayjs";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";

export const calculateContractRemainingDays = (
  endDateString: string | Date | null
) => {
  if (!endDateString) return null;
  const today = dayjs().startOf("day");
  const endDate = dayjs(endDateString).startOf("day");
  return endDate.diff(today, "day");
};

export const mapEmployeesData = (employees: ListedEmployee[]) => {
  if (!employees) return [];

  const groupCounters: Record<number | string, number> = {};

  return employees.map((emp) => {
    const sectionId = emp.payrollSectionId ?? "unassigned";
    groupCounters[sectionId] = (groupCounters[sectionId] || 0) + 1;

    // Calculate total allowance
    const totalAllowance =
      (Number(emp.foodAllowance) || 0) +
      (Number(emp.mobileAllowance) || 0) +
      (Number(emp.otherAllowance) || 0);

    // Calculate contract remaining days
    const contractRemainingDays = calculateContractRemainingDays(
      emp.contractEndDate
    );

    return {
      ...emp,
      designationName: emp.designation?.nameEn,
      sectionName: emp.payrollSection?.nameEn || "Unassigned",
      statusName: emp.status?.nameEn,
      countryName: emp.country?.nameEn || "-",
      cityName: emp.city?.nameEn || "-",
      branchName: emp.branch?.nameEn || "-",
      gosiCityName: emp.gosiCity?.nameEn || "-",
      nationalityName: emp.nationality?.nameEn || "-",
      totalAllowance,
      contractRemainingDays,
      groupSerial: groupCounters[sectionId],
    };
  });
};
