const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

/**
 * Transform Payroll Master CSV Data to JSON matching Prisma Schema (PayrollSummary)
 */

const CSV_FILE = path.join(__dirname, "../data/PayrollMaster.csv");
const OUTPUT_FILE = path.join(__dirname, "payroll-summary-data.json");

// Helper function to parse date
function parseDate(dateStr) {
  if (!dateStr || dateStr === "NULL" || dateStr.trim() === "") {
    return null;
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.toISOString();
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

// Helper function to clean string
function cleanString(value) {
  if (!value || value === "NULL" || value.trim() === "") {
    return null;
  }
  return value.trim();
}

// Transform a single payroll summary record
function transformPayrollSummary(row) {
  // Handle potential BOM character in CSV column names
  const idValue = row.Id || row["\ufeffId"] || row["﻿Id"];

  return {
    id: parseInt(idValue, 10) || undefined, // undefined allows autoincrement if we don't want to force ID, but usually for migration we keep it
    payrollMonth: parseInteger(row.PayrollMonth),
    payrollYear: parseInteger(row.PayrollYear),

    // Financials
    totalSalary: parseDecimal(row.TotalSalary),
    totalBreakfastAllowance: 0, // Default as not in CSV
    totalOtherAllowances: 0, // Default as not in CSV

    totalPreviousLoan: parseDecimal(row.TotalPreviousAdvance),
    totalCurrentLoan: parseDecimal(row.TotalCurrentAdvance),
    totalLoanDeduction: parseDecimal(row.TotalDeduction),
    totalNetLoan: parseDecimal(row.TotalNetLoan),

    totalPreviousChallan: parseDecimal(row.TotalPreviousTrafficChallan),
    totalCurrentChallan: parseDecimal(row.TotalCurrentTrafficChallan),
    totalChallanDeduction: parseDecimal(row.TotalTrafficDeduction),
    totalNetChallan: parseDecimal(row.TotalNetTraffChallan),

    totalNetSalaryPayable: parseDecimal(row.TotalNetSalaryPayable),
    totalCardSalary: parseDecimal(row.TotalCardSalary),
    totalCashSalary: parseDecimal(row.TotalCashSalary),

    remarks: cleanString(row.Remarks),

    // Relations
    payrollStatusId: parseInteger(row.PayrollStatusId),
    branchId: parseInteger(row.BranchId),

    // Metadata
    createdDate: parseDate(row.CreatedDate) || new Date().toISOString(),
    createdBy: parseInteger(row.CreatedBy),
    modifiedDate: parseDate(row.ModifiedDate) || new Date().toISOString(),
    modifiedBy: parseInteger(row.ModifiedBy),
  };
}

// Main transformation function
async function transformCSVToJSON() {
  const summaries = [];
  let processedCount = 0;
  let errorCount = 0;

  console.log("🚀 Starting Payroll CSV to JSON transformation...");
  console.log(`📂 Reading from: ${CSV_FILE}`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on("data", (row) => {
        try {
          const summary = transformPayrollSummary(row);
          summaries.push(summary);
          processedCount++;

          if (processedCount % 100 === 0) {
            console.log(`✅ Processed ${processedCount} records...`);
          }
        } catch (error) {
          errorCount++;
          console.error(
            `❌ Error processing record ID ${row.Id}:`,
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
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(summaries, null, 2));
        console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);
        console.log(`✨ Transformation complete!`);

        resolve(summaries);
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

module.exports = { transformCSVToJSON, transformPayrollSummary };
