const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

/**
 * Transform Timesheet CSV Data to JSON matching Prisma Schema
 *
 * Business Logic:
 * - Group timesheets by employeeId
 * - Schema only supports 2 projects (Project1 and Project2)
 * - Project3 data from CSV is ignored as schema doesn't support it
 * - Convert decimal hours to integers (rounding)
 */

const CSV_FILE = path.join(__dirname, "../data/Timesheets.csv");
const OUTPUT_DIR = path.join(__dirname, "timesheet-data");

// Helper function to parse date
function parseDate(dateStr) {
  if (!dateStr || dateStr === "NULL" || dateStr.trim() === "") {
    return null;
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
}

// Helper function to parse decimal to integer (hours)
function parseHours(value) {
  if (!value || value === "NULL" || value.trim() === "") {
    return null;
  }
  const parsed = parseFloat(value);
  if (isNaN(parsed) || parsed === 0) {
    return null;
  }
  return Math.round(parsed); // Round to nearest integer
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

// Helper function to validate if timesheet has meaningful data
function isValidTimesheet(timesheet) {
  // Check if date is realistic (between 2000 and 2030)
  if (timesheet.date) {
    const year = new Date(timesheet.date).getFullYear();
    if (year < 2000 || year > 2030) {
      return { isValid: false, reason: `Unrealistic date year: ${year}` };
    }
  } else {
    return { isValid: false, reason: "No date provided" };
  }

  return { isValid: true, reason: null };
}

// Transform a single timesheet record
function transformTimesheet(row) {
  // Handle potential BOM character in CSV column names
  const idValue = row.Id || row["\ufeffId"] || row["﻿Id"];
  const id = parseInteger(idValue);
  const employeeId = parseInteger(row.EmployeeId);
  const date = parseDate(row.TimesheetDate);

  // Parse project data (only Project1 and Project2 - schema doesn't support Project3)
  const project1Id = parseInteger(row.Project1_Id);
  const project1Hours = parseHours(row.Project1_Hours);
  const project1Overtime = parseHours(row.Project1_OT);

  const project2Id = parseInteger(row.Project2_Id);
  const project2Hours = parseHours(row.Project2_Hours);
  const project2Overtime = parseHours(row.Project2_OT);

  const totalHours = parseHours(row.TOTAL_HOURS);
  const description = cleanString(row.Remarks);
  const isLocked = parseBoolean(row.IsLocked);

  return {
    id,
    employeeId,
    date,
    project1Id,
    project1Hours,
    project1Overtime,
    project2Id,
    project2Hours,
    project2Overtime,
    totalHours,
    description,
    isLocked,
  };
}

// Main transformation function
async function transformCSVToJSON() {
  const timesheetsByEmployee = {};
  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const skipReasons = {};

  console.log("🚀 Starting CSV to JSON transformation...");
  console.log(`📂 Reading from: ${CSV_FILE}`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on("data", (row) => {
        try {
          const timesheet = transformTimesheet(row);
          console.log("timesheet ==> ", timesheet);
          // Skip if essential data is missing
          if (!timesheet.id || !timesheet.employeeId || !timesheet.date) {
            skippedCount++;
            const reason = "Missing essential data (id/employeeId/date)";
            skipReasons[reason] = (skipReasons[reason] || 0) + 1;
            return;
          }

          // Skip if timesheet is invalid (no project data, no hours, unrealistic date)
          const validation = isValidTimesheet(timesheet);
          if (!validation.isValid) {
            skippedCount++;
            skipReasons[validation.reason] =
              (skipReasons[validation.reason] || 0) + 1;
            return;
          }

          // Group by employeeId
          if (!timesheetsByEmployee[timesheet.employeeId]) {
            timesheetsByEmployee[timesheet.employeeId] = [];
          }

          timesheetsByEmployee[timesheet.employeeId].push(timesheet);
          processedCount++;

          if (processedCount % 10000 === 0) {
            console.log(`✅ Processed ${processedCount} timesheets...`);
          }
        } catch (error) {
          errorCount++;
          if (errorCount <= 10) {
            console.error(
              `❌ Error processing timesheet ID ${row.Id}:`,
              error.message
            );
          }
        }
      })
      .on("end", () => {
        console.log(`\n📊 Transformation Summary:`);
        console.log(`   Total processed: ${processedCount}`);
        console.log(`   Skipped: ${skippedCount}`);
        console.log(`   Errors: ${errorCount}`);
        console.log(
          `   Unique employees: ${Object.keys(timesheetsByEmployee).length}`
        );

        // Show skip reasons
        if (Object.keys(skipReasons).length > 0) {
          console.log(`\n⚠️  Skip Reasons:`);
          Object.entries(skipReasons)
            .sort((a, b) => b[1] - a[1])
            .forEach(([reason, count]) => {
              console.log(`   ${reason}: ${count}`);
            });
        }

        // Create output directory if it doesn't exist
        if (!fs.existsSync(OUTPUT_DIR)) {
          fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        // Write each employee's timesheets to a separate file
        let fileCount = 0;
        const employeeIds = Object.keys(timesheetsByEmployee).sort(
          (a, b) => parseInt(a) - parseInt(b)
        );

        console.log(`\n💾 Writing timesheet files...`);

        for (const employeeId of employeeIds) {
          const timesheets = timesheetsByEmployee[employeeId];
          const outputFile = path.join(
            OUTPUT_DIR,
            `employee_${employeeId}.json`
          );

          fs.writeFileSync(
            outputFile,
            JSON.stringify(
              {
                employeeId: parseInt(employeeId),
                timesheets: timesheets.sort(
                  (a, b) => new Date(a.date) - new Date(b.date)
                ),
              },
              null,
              2
            )
          );

          fileCount++;

          if (fileCount % 100 === 0) {
            console.log(
              `   Written ${fileCount}/${employeeIds.length} files...`
            );
          }
        }

        console.log(`\n✨ Transformation complete!`);
        console.log(`📁 Output directory: ${OUTPUT_DIR}`);
        console.log(`📄 Total files created: ${fileCount}`);

        resolve(timesheetsByEmployee);
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

module.exports = { transformCSVToJSON, transformTimesheet };
