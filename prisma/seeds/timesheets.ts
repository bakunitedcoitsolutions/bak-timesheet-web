/**
 * Timesheet Seed Script
 * Imports timesheet data from prisma/timesheet-data/*.json files
 */

import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "../generated/prisma/client";

interface TimesheetData {
  id: number;
  employeeId: number;
  date: string;
  project1Id: number | null;
  project1Hours: number | null;
  project1Overtime: number | null;
  project2Id: number | null;
  project2Hours: number | null;
  project2Overtime: number | null;
  totalHours: number | null;
  description: string | null;
  isLocked: boolean;
}

interface EmployeeTimesheetFile {
  employeeId: number;
  timesheets: TimesheetData[];
}

export async function seedTimesheets(prisma: PrismaClient) {
  const dataDir = path.join(__dirname, "../timesheet-data");

  console.log(`  📂 Reading from: ${dataDir}`);

  // Get all JSON files
  const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => {
      const idA = parseInt(a.replace("employee_", "").replace(".json", ""));
      const idB = parseInt(b.replace("employee_", "").replace(".json", ""));
      return idA - idB;
    });

  console.log(`  📄 Found ${files.length} employee timesheet files`);

  let totalTimesheets = 0;
  let insertedCount = 0;
  let skippedCount = 0;
  let employeeCount = 0;

  // Cache employee IDs to avoid repeated database queries
  console.log("  👥 Fetching employee IDs from database...");
  const employees = await prisma.employee.findMany({
    select: { id: true },
  });
  const employeeIds = new Set(employees.map((emp) => emp.id));
  console.log(`  ✅ Found ${employees.length} employees in database\n`);

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data: EmployeeTimesheetFile = JSON.parse(fileContent);

    employeeCount++;
    const timesheets = data.timesheets;
    totalTimesheets += timesheets.length;

    // Check if employee exists (using cached set for performance)
    if (!employeeIds.has(data.employeeId)) {
      console.warn(
        `  ⚠️  Employee ID ${data.employeeId} not found in database, skipping ${timesheets.length} timesheets`
      );
      skippedCount += timesheets.length;
      continue;
    }

    // Log progress immediately
    if (employeeCount === 1 || employeeCount % 50 === 0) {
      console.log(
        `  💾 Processing ${employeeCount}/${files.length} employees (${insertedCount} timesheets inserted so far)...`
      );
    }

    // Batch insert timesheets for this employee using createMany
    try {
      const timesheetData = timesheets.map((timesheet) => ({
        id: timesheet.id,
        employeeId: timesheet.employeeId,
        date: new Date(timesheet.date),
        project1Id: timesheet.project1Id,
        project1Hours: timesheet.project1Hours,
        project1Overtime: timesheet.project1Overtime,
        project2Id: timesheet.project2Id,
        project2Hours: timesheet.project2Hours,
        project2Overtime: timesheet.project2Overtime,
        totalHours: timesheet.totalHours,
        description: timesheet.description,
        isLocked: timesheet.isLocked,
      }));

      const result = await prisma.timesheet.createMany({
        data: timesheetData,
        skipDuplicates: true, // Skip if ID already exists
      });

      insertedCount += result.count;
    } catch (error) {
      console.warn(
        `  ⚠️  Error inserting timesheets for employee ${data.employeeId}:`,
        error instanceof Error ? error.message : error
      );
      skippedCount += timesheets.length;
    }
  }

  console.log(`\n  📊 Seeding Summary:`);
  console.log(`     Employees processed: ${employeeCount}`);
  console.log(`     Total timesheets: ${totalTimesheets}`);
  console.log(`     Successfully inserted: ${insertedCount}`);
  console.log(`     Skipped: ${skippedCount}`);

  // Print summary statistics
  const timesheetStats = await prisma.timesheet.groupBy({
    by: ["employeeId"],
    _count: { id: true },
  });

  console.log(`\n  📊 Timesheet Statistics:`);
  console.log(`     Total employees with timesheets: ${timesheetStats.length}`);
  console.log(
    `     Total timesheets in database: ${timesheetStats.reduce(
      (sum, stat) => sum + stat._count.id,
      0
    )}`
  );

  console.log(`  ✅ Successfully seeded timesheets`);
}
