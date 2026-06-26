import { GlobalData } from "@/context/GlobalDataContext";

const normalizeHeader = (header: string) =>
  header.toLowerCase().replace(/[^a-z0-9]/g, "");

// Aliases mapping normalized headers to actual Prisma field names
const HEADER_ALIASES: Record<string, string> = {
  code: "employeeCode",
  empcode: "employeeCode",
  employeecode: "employeeCode",
};

/**
 * Given a normalized header string, tries to resolve the Prisma field name.
 */
const resolveFieldName = (normalizedKey: string, allColumns: any[]) => {
  if (HEADER_ALIASES[normalizedKey]) {
    return HEADER_ALIASES[normalizedKey];
  }
  const match = allColumns.find(
    (c) => normalizeHeader(c.label) === normalizedKey
  );
  return match ? match.value : undefined;
};

/**
 * Utility to find a cell value in a row by its Prisma field name
 * (checks all possible column labels that resolve to this field).
 */
const getCellValueByField = (
  row: any,
  fieldName: string,
  allColumns: any[]
) => {
  for (const [key, value] of Object.entries(row)) {
    const normKey = normalizeHeader(key);
    if (resolveFieldName(normKey, allColumns) === fieldName) {
      return value;
    }
  }
  return undefined;
};

export const validateBulkEmployeeData = (
  rawData: any[],
  linkedColumns: any[],
  globalData: GlobalData,
  allColumns: any[]
) => {
  const beforeReportDetails: any[] = [];
  let successCount = 0;
  let failedCount = 0;

  rawData.forEach((row, index) => {
    const rowNum = index + 2; // +1 for 0-index, +1 for header

    // Use the robust fetcher to get employee code
    const employeeCodeValue = getCellValueByField(
      row,
      "employeeCode",
      allColumns
    );
    const employeeCode = employeeCodeValue || `Row ${rowNum}`;
    let hasError = false;
    const rowErrors: string[] = [];

    if (!employeeCodeValue || employeeCodeValue.toString().trim() === "") {
      hasError = true;
      rowErrors.push('Missing "Employee Code"');
    }

    linkedColumns.forEach((col) => {
      // Use the robust fetcher to get the cell value
      const cellValue = getCellValueByField(row, col.value, allColumns);

      if (cellValue && cellValue.toString().trim() !== "") {
        const val = cellValue.toString().trim();
        let isValid = false;

        // Check against global data based on column ID or value field
        switch (col.value) {
          case "countryName":
          case "nationalityName":
            isValid = globalData.countries.some(
              (c) => c.nameEn.toLowerCase() === val.toLowerCase()
            );
            break;
          case "cityName":
            isValid = globalData.cities.some(
              (c) => c.nameEn.toLowerCase() === val.toLowerCase()
            );
            break;
          case "statusName":
            isValid = globalData.employeeStatuses.some(
              (c) => c.nameEn.toLowerCase() === val.toLowerCase()
            );
            break;
          case "branchName":
            isValid = globalData.branches.some(
              (c) =>
                c.nameEn.toLowerCase() === val.toLowerCase() &&
                c.isMain === true
            );
            break;
          case "subBranchName":
            isValid = globalData.branches.some(
              (c) =>
                c.nameEn.toLowerCase() === val.toLowerCase() &&
                c.isMain === false
            );
            break;
          case "designationName":
            isValid = globalData.designations.some(
              (c) => c.nameEn.toLowerCase() === val.toLowerCase()
            );
            break;
          case "sectionName":
            isValid = globalData.payrollSections.some(
              (c) => c.nameEn.toLowerCase() === val.toLowerCase()
            );
            break;
          case "gosiCityName":
            isValid = globalData.gosiCities.some(
              (c) => c.nameEn.toLowerCase() === val.toLowerCase()
            );
            break;
          default:
            isValid = true; // Skip if we don't know how to validate
        }

        if (!isValid) {
          hasError = true;
          rowErrors.push(`Invalid ${col.label}: "${val}"`);
        }
      }
    });

    if (hasError) {
      failedCount++;
      beforeReportDetails.push({
        row: rowNum,
        employeeCode: employeeCode,
        status: "failed",
        message: rowErrors.join(", "),
      });
    } else {
      successCount++;
    }
  });

  return { beforeReportDetails, successCount, failedCount };
};

export const mapBulkEmployeeDataToIds = (
  rawData: any[],
  linkedColumns: any[],
  globalData: GlobalData,
  allColumns: any[]
) => {
  return rawData.map((row) => {
    const newRow: Record<string, any> = {};

    // First, convert all label-keyed fields to field-keyed fields
    for (const [key, value] of Object.entries(row)) {
      const normKey = normalizeHeader(key);
      const fieldName = resolveFieldName(normKey, allColumns);

      if (fieldName) {
        newRow[fieldName] = value;
      } else {
        newRow[key] = value; // Keep unknown fields as-is
      }
    }

    // Ensure employeeCode is a number
    if (newRow.employeeCode !== undefined) {
      newRow.employeeCode = Number(newRow.employeeCode);
    }

    // Then, resolve linked columns: replace name with ID
    linkedColumns.forEach((col) => {
      const fieldName = col.value; // e.g. "countryName"
      const cellValue = newRow[fieldName];
      if (cellValue && cellValue.toString().trim() !== "") {
        const val = cellValue.toString().trim();
        let matchedId: number | undefined;

        switch (col.value) {
          case "countryName":
          case "nationalityName":
            matchedId = globalData.countries.find(
              (c) => c.nameEn.toLowerCase() === val.toLowerCase()
            )?.id;
            break;
          case "cityName":
            matchedId = globalData.cities.find(
              (c) => c.nameEn.toLowerCase() === val.toLowerCase()
            )?.id;
            break;
          case "statusName":
            matchedId = globalData.employeeStatuses.find(
              (c) => c.nameEn.toLowerCase() === val.toLowerCase()
            )?.id;
            break;
          case "branchName":
            matchedId = globalData.branches.find(
              (c) =>
                c.nameEn.toLowerCase() === val.toLowerCase() &&
                c.isMain === true
            )?.id;
            break;
          case "subBranchName":
            matchedId = globalData.branches.find(
              (c) =>
                c.nameEn.toLowerCase() === val.toLowerCase() &&
                c.isMain === false
            )?.id;
            break;
          case "designationName":
            matchedId = globalData.designations.find(
              (c) => c.nameEn.toLowerCase() === val.toLowerCase()
            )?.id;
            break;
          case "sectionName":
            matchedId = globalData.payrollSections.find(
              (c) => c.nameEn.toLowerCase() === val.toLowerCase()
            )?.id;
            break;
          case "gosiCityName":
            matchedId = globalData.gosiCities.find(
              (c) => c.nameEn.toLowerCase() === val.toLowerCase()
            )?.id;
            break;
        }

        if (matchedId !== undefined) {
          const idKey = col.value.replace("Name", "Id");
          newRow[idKey] = matchedId;
          delete newRow[fieldName]; // Remove the name field
        }
      }
    });

    return newRow;
  });
};
