const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

/**
 * Transform Payroll Details CSV Data to JSON matching Prisma Schema (PayrollDetails)
 */

const CSV_FILE = path.join(__dirname, "../data/PayrollDetails.csv");
const OUTPUT_FILE = path.join(__dirname, "payroll-details-data.json");

// Helper functions (reused/adapted)
function parseDate(dateStr) {
  if (!dateStr || dateStr === "NULL" || dateStr.trim() === "") {
    return null;
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

function parseDecimal(value) {
  if (!value || value === "NULL" || value.trim() === "") {
    return 0;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function parseInteger(value) {
  if (!value || value === "NULL" || value.trim() === "") {
    return null;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

function cleanString(value) {
  if (!value || value === "NULL" || value.trim() === "") {
    return null;
  }
  return value.trim();
}

// Transform a single payroll detail record
function transformPayrollDetail(row) {
  // Handle potential BOM
  const idValue = row.Id || row["\ufeffId"] || row["﻿Id"];

  const allowance = parseDecimal(row.Allowance);
  const breakfastAllowance = 0; // Default as not in CSV specifically, assuming 'Allowance' is other/total
  const otherAllowances = allowance; // Map CSV Allowance to otherAllowances
  const totalAllowances = breakfastAllowance + otherAllowances;
  let paymentMethodId = parseInteger(row.PayrollProjectId);
  if (paymentMethodId === 52) {
    paymentMethodId = 4;
  } else if (paymentMethodId === 53) {
    paymentMethodId = 5;
  } else if (paymentMethodId === 51) {
    paymentMethodId = 1;
  } else {
    paymentMethodId = 1;
  }

  return {
    id: parseInt(idValue, 10) || undefined,
    payrollId: parseInteger(row.PayrollId),
    payrollMonth: parseInteger(row.PayrollMonth),
    payrollYear: parseInteger(row.PayrollYear),
    employeeId: parseInteger(row.EmployeeId),

    workDays: Math.round(parseDecimal(row.WorkDays)), // Schema is Int
    totalHours: parseDecimal(row.TotalHours),
    hourlyRate: parseDecimal(row.HourlyRate),
    overTime: parseDecimal(row.OverTime),

    // Allowances
    breakfastAllowance: breakfastAllowance,
    otherAllowances: otherAllowances,
    totalAllowances: totalAllowances,

    salary: parseDecimal(row.Salary), // Basic salary? Or total? verify context. Usually Salary + Allowances - Deductions = Net.
    // In many systems "Salary" in details is the basic calculated salary.

    // Loans
    previousLoan: parseDecimal(row.PreviousAdvance),
    currentLoan: parseDecimal(row.CurrentAdvance),
    loanDeduction: parseDecimal(row.Deduction),
    netLoan: parseDecimal(row.NetLoan),

    // Challans
    previousChallan: parseDecimal(row.PreviousTrafficChallan),
    currentChallan: parseDecimal(row.CurrentTrafficChallan),
    challanDeduction: parseDecimal(row.TrafficDeduction),
    netChallan: parseDecimal(row.NetTraffChallan),

    // Net
    netSalaryPayable: parseDecimal(row.NetSalaryPayable),
    cardSalary: parseDecimal(row.CardSalary),
    cashSalary: parseDecimal(row.CashSalary),

    remarks: cleanString(row.Remarks),

    // Relations & Metadata
    payrollStatusId: parseInteger(row.PayrollStatusId),
    branchId: parseInteger(row.BranchId), // Might be null in CSV, handle gracefully
    paymentMethodId: paymentMethodId,

    createdDate: parseDate(row.CreatedDate) || new Date().toISOString(),
    modifiedDate: parseDate(row.ModifiedDate) || new Date().toISOString(),

    // Defaults
    isLocked: true,
  };
}

// Main transformation function
async function transformCSVToJSON() {
  const details = [];
  let processedCount = 0;
  let errorCount = 0;

  console.log("🚀 Starting Payroll Details CSV to JSON transformation...");
  console.log(`📂 Reading from: ${CSV_FILE}`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on("data", (row) => {
        try {
          const detail = transformPayrollDetail(row);
          // Simple validation: must have employeeId and payrollId
          if (detail.employeeId && detail.payrollId) {
            details.push(detail);
            processedCount++;
          } else {
            // console.warn(`Skipping row with missing ID links:`, row);
          }

          if (processedCount % 1000 === 0) {
            console.log(`✅ Processed ${processedCount} records...`);
          }
        } catch (error) {
          errorCount++;
          // console.error(`❌ Error processing row:`, error.message);
        }
      })
      .on("end", () => {
        console.log(`\n📊 Transformation Summary:`);
        console.log(`   Total processed: ${processedCount}`);
        console.log(`   Errors: ${errorCount}`);

        // Write to JSON file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(details, null, 2));
        console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);
        console.log(`✨ Transformation complete!`);

        resolve(details);
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

module.exports = { transformCSVToJSON, transformPayrollDetail };
