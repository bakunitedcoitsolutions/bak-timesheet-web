const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

/**
 * Transform Employee CSV Data to JSON matching Prisma Schema
 *
 * Business Logic:
 * - If isFixed = true: salary = hourlyRate × 30, then set hourlyRate = 0
 * - If isFixed = false: keep hourlyRate as is, set salary = 0
 * - If hourlyRate = 0 in source: leave both as 0
 */

const CSV_FILE = path.join(__dirname, "../data/Employees.csv");
const OUTPUT_FILE = path.join(__dirname, "employee-data.json");

// Helper function to parse date
function parseDate(dateStr) {
  if (!dateStr || dateStr === "NULL" || dateStr.trim() === "") {
    return null;
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
}

// Helper function to parse decimal
function parseDecimal(value) {
  if (!value || value === "NULL" || value.trim() === "") {
    return 0;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function to parse integer
function parseInteger(value) {
  if (!value || value === "NULL" || value.trim() === "") {
    return null;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

// Helper function to parse boolean
function parseBoolean(value) {
  if (
    !value ||
    value === "NULL" ||
    value.trim() === "" ||
    value == false ||
    value == "false" ||
    value == 0
  ) {
    return false;
  }
  return (
    value == 1 ||
    value == "1" ||
    value?.toLowerCase?.() === "true" ||
    value == true
  );
}

// Helper function to clean string
function cleanString(value) {
  if (!value || value === "NULL" || value.trim() === "") {
    return null;
  }
  return value.trim();
}

// Helper function to get bank name from bank code
function getBankName(bankCode) {
  if (!bankCode || bankCode === "NULL" || bankCode.trim() === "") {
    return null;
  }

  const bankCodeUpper = bankCode.trim().toUpperCase();

  const bankMapping = {
    SABB: "Saudi British Bank (SABB)",
    RJHI: "Al Rajhi Bank",
    ALBI: "Bank Al Bilad",
    ARNB: "Arab National Bank (ANB)",
    BJAZ: "Bank Al Jazira",
    BSFR: "Banque Saudi Fransi",
    INMA: "Alinma Bank",
    NCBK: "National Commercial Bank (NCB)",
    RIBL: "Riyad Bank",
    SIBC: "Saudi Investment Bank (SAIB)",
  };

  return bankMapping[bankCodeUpper] || bankCode; // Return original code if not found
}

const designationIdsWhichHas8HoursAday = [5, 46, 48, 50, 52, 53, 59, 60];
const designationIdsWhichHasBfAllowanceTrue = [
  1, 2, 3, 4, 5, 8, 9, 20, 21, 22, 23, 37, 40, 44,
];
// const designationIdsWhichWhoHasTruckHouse = [25, 35, 42, 65];
const payrollSectionIdsWhichWhoHasTruckHouse = [6, 15];

// Transform a single employee record
function transformEmployee(row) {
  const hourlyRate = parseDecimal(row.HourlyRate);
  const isFixed = parseBoolean(row.IsFixedSalary);
  const designationId = parseInteger(row.DesignationId);
  const payrollSectionId = parseInteger(row.PayrollSectionId);

  // Determine hours per day based on designation
  const hoursPerDay = designationIdsWhichHas8HoursAday.includes(designationId)
    ? 8
    : 10;

  // Determine breakfast allowance based on designation
  const breakfastAllowance =
    designationIdsWhichHasBfAllowanceTrue.includes(designationId);

  // Determine branchId and gosiCityId based on payroll section
  const hasTruckHouse =
    payrollSectionIdsWhichWhoHasTruckHouse.includes(payrollSectionId);
  const branchId = hasTruckHouse ? 2 : 1;
  const gosiCityId = hasTruckHouse ? 3 : 1;

  const genderCode = cleanString(row.GenderCode);
  const gender = genderCode ? (genderCode === "M" ? "Male" : "Female") : null;

  // Apply business logic for salary/hourly rate
  let finalHourlyRate = 0;
  let finalSalary = 0;

  if (isFixed) {
    if (hourlyRate > 0) {
      finalSalary = hourlyRate * hoursPerDay * 30;
      finalHourlyRate = 0;
    } else {
      finalSalary = 0;
      finalHourlyRate = 0;
    }
  } else {
    finalHourlyRate = hourlyRate;
    finalSalary = 0;
  }

  // Handle potential BOM character in CSV column names
  const idValue = row.Id || row["\ufeffId"] || row["﻿Id"];

  return {
    id: parseInt(idValue, 10) || null,
    employeeCode: parseInteger(row.EmpCode),
    profilePicture: cleanString(row.PhotoDocLink),
    nameEn: cleanString(row.FullName),
    nameAr: cleanString(row.FullNameAr),
    dob: parseDate(row.BirthDate),
    phone: cleanString(row.MobileNo),

    // Step 2: Employment Details
    gender,
    countryId: parseInteger(row.CountryId),
    nationalityId: parseInteger(row.NationalityId),
    cityId: parseInteger(row.CityId),
    statusId: parseInteger(row.EmployeeStatusId),
    branchId,
    designationId: parseInteger(row.DesignationId),
    payrollSectionId,
    isDeductable: parseBoolean(row.IsDeductable),
    isFixed: isFixed,
    workingDays: parseInteger(row.WorkDays),
    hourlyRate: finalHourlyRate,
    salary: finalSalary,
    breakfastAllowance,
    foodAllowance: parseDecimal(row.FoodAllowance),
    mobileAllowance: parseDecimal(row.MobileAllowance),
    otherAllowance: parseDecimal(row.OtherAllowance),
    contractStartDate: parseDate(row.ContractStartDate),
    contractEndDate: parseDate(row.ContractEndDate),
    contractDocument: null, // Not in CSV
    contractEndReason: cleanString(row.ContractEndReason),
    joiningDate: parseDate(row.JoiningDate),

    // Step 3: Documents & Identity
    idCardNo: cleanString(row.IdCardNo),
    idCardExpiryDate: parseDate(row.IdCardExpiry),
    idCardDocument: cleanString(row.IdCardDocLink),
    profession: cleanString(row.IdCardProfession),
    passportNo: cleanString(row.PassportNo),
    passportExpiryDate: parseDate(row.PassportExpiry),
    passportDocument: cleanString(row.PassportDocLink),
    lastExitDate: null, // Not in CSV
    lastEntryDate: null, // Not in CSV

    // Step 4: Banking & GOSI
    bankName: getBankName(row.BankCode),
    bankCode: cleanString(row.BankCode),
    iban: cleanString(row.IBAN),
    gosiSalary: parseDecimal(row.GosiSalary),
    gosiCityId,

    // Step 5: Loan & Card Details
    openingBalance: parseDecimal(row.OpeningBalanceLoan),
    isCardDelivered: parseBoolean(row.IsCardDelivered),
    cardDocument: null, // Not in CSV
  };
}

// Main transformation function
async function transformCSVToJSON() {
  const employees = [];
  let processedCount = 0;
  let errorCount = 0;

  console.log("🚀 Starting CSV to JSON transformation...");
  console.log(`📂 Reading from: ${CSV_FILE}`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on("data", (row) => {
        try {
          const employee = transformEmployee(row);
          employees.push(employee);
          processedCount++;

          if (processedCount % 100 === 0) {
            console.log(`✅ Processed ${processedCount} employees...`);
          }
        } catch (error) {
          errorCount++;
          console.error(
            `❌ Error processing employee ID ${row.Id}:`,
            error.message
          );
        }
      })
      .on("end", () => {
        console.log(`\n📊 Transformation Summary:`);
        console.log(`   Total processed: ${processedCount}`);
        console.log(`   Errors: ${errorCount}`);
        console.log(`   Success: ${processedCount - errorCount}`);

        // Write to JSON file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(employees, null, 2));
        console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);
        console.log(`✨ Transformation complete!`);

        resolve(employees);
      })
      .on("error", (error) => {
        console.error("❌ Error reading CSV:", error);
        reject(error);
      });
  });
}

// Run the transformation
if (require.main === module) {
  transformCSVToJSON()
    .then(() => {
      console.log("\n🎉 All done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Fatal error:", error);
      process.exit(1);
    });
}

module.exports = { transformCSVToJSON, transformEmployee };
