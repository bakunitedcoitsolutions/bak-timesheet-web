/**
 * Traffic Challan Seed Script
 * Imports traffic challan data from data/TrafficChallans.csv
 */

import * as fs from "fs";
import * as path from "path";
import csv from "csv-parser";
import { PrismaClient, TrafficChallanType } from "../generated/prisma/client";

interface CSVChallanRow {
  Id: string;
  EmployeeId: string;
  TransactionDate: string;
  ChallanAmount: string;
  DeductionAmount: string;
  Remarks: string;
}

interface ProcessedChallan {
  id: number;
  employeeId: number;
  date: Date;
  type: TrafficChallanType;
  amount: number;
  description: string | null;
}

// Helper function to parse decimal
function parseDecimal(value: string): number {
  if (!value || value === "NULL" || value.trim() === "") {
    return 0;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function to parse integer
function parseInteger(value: string): number {
  if (!value || value === "NULL" || value.trim() === "") {
    return 0;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function to parse date
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === "NULL" || dateStr.trim() === "") {
    return null;
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// Helper function to clean string
function cleanString(value: string): string | null {
  if (!value || value === "NULL" || value.trim() === "") {
    return null;
  }
  return value.trim();
}

export async function seedTrafficChallans(prisma: PrismaClient) {
  const csvPath = path.join(__dirname, "../../data/TrafficChallans.csv");

  console.log(`  📂 Reading from: ${csvPath}`);

  // Get all employee IDs to verify they exist
  const employees = await prisma.employee.findMany({
    select: { id: true },
  });

  const employeeIds = new Set(employees.map((emp) => emp.id));
  console.log(`  👥 Found ${employees.length} employees in database`);

  // Process and transform challan data
  const processedChallans: ProcessedChallan[] = [];
  let processedCount = 0;
  let skippedCount = 0;
  let missingEmployeeCount = 0;

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row: any) => {
        try {
          // Handle potential BOM character in CSV column names
          const idValue = row.Id || row["\ufeffId"] || row["﻿Id"];
          const id = parseInteger(idValue);
          const employeeId = parseInteger(row.EmployeeId);
          const challanAmount = parseDecimal(row.ChallanAmount);
          const deductionAmount = parseDecimal(row.DeductionAmount);

          processedCount++;

          // Skip if ID is invalid
          if (id === 0) {
            console.warn(
              `  ⚠️  [SKIP] Invalid ID: "${idValue}" (Row ${processedCount})`
            );
            skippedCount++;
            return;
          }

          // Skip if both amounts are 0 or invalid
          if (challanAmount === 0 && deductionAmount === 0) {
            console.warn(
              `  ⚠️  [SKIP] Both amounts are 0 for challan ID ${id} (Row ${processedCount})`
            );
            skippedCount++;
            return;
          }

          // Parse date
          const date = parseDate(row.TransactionDate);
          if (!date) {
            console.warn(
              `  ⚠️  [SKIP] Invalid date for challan ID ${id}: "${row.TransactionDate}" (Row ${processedCount})`
            );
            skippedCount++;
            return;
          }

          // Determine challan type and amount
          let type: TrafficChallanType;
          let amount: number;

          if (challanAmount > 0) {
            type = TrafficChallanType.CHALLAN;
            amount = challanAmount;
          } else if (deductionAmount > 0) {
            type = TrafficChallanType.RETURN;
            amount = deductionAmount;
          } else if (challanAmount < 0) {
            // Handle negative challan amounts as returns
            type = TrafficChallanType.RETURN;
            amount = Math.abs(challanAmount);
          } else {
            console.warn(
              `  ⚠️  [SKIP] No valid amount for challan ID ${id} (Row ${processedCount})`
            );
            skippedCount++;
            return;
          }

          // Check if employee exists
          if (!employeeIds.has(employeeId)) {
            console.warn(
              `  ⚠️  [SKIP] Employee ID ${employeeId} not found for challan ID ${id} (Row ${processedCount})`
            );
            missingEmployeeCount++;
            return;
          }

          processedChallans.push({
            id,
            employeeId,
            date,
            type,
            amount,
            description: cleanString(row.Remarks),
          });

          if (processedCount % 500 === 0) {
            console.log(`  📄 Processed ${processedCount} rows...`);
          }
        } catch (error) {
          console.warn(
            `  ⚠️  [SKIP] Error processing row ${processedCount}:`,
            error
          );
          skippedCount++;
        }
      })
      .on("end", async () => {
        console.log(`\n  📊 Processing Summary:`);
        console.log(`     Total rows: ${processedCount}`);
        console.log(`     Valid challans: ${processedChallans.length}`);
        console.log(`     Skipped: ${skippedCount}`);
        console.log(`     Missing employees: ${missingEmployeeCount}`);

        // Insert challans individually using upsert to preserve IDs
        let insertedCount = 0;

        for (let i = 0; i < processedChallans.length; i++) {
          const challan = processedChallans[i];

          await prisma.trafficChallan.upsert({
            where: { id: challan.id },
            update: {
              employeeId: challan.employeeId,
              date: challan.date,
              type: challan.type,
              amount: challan.amount,
              description: challan.description,
            },
            create: {
              id: challan.id,
              employeeId: challan.employeeId,
              date: challan.date,
              type: challan.type,
              amount: challan.amount,
              description: challan.description,
            },
          });

          insertedCount++;

          if (
            i === 0 ||
            (i + 1) % 100 === 0 ||
            i === processedChallans.length - 1
          ) {
            console.log(`  💾 Inserting: ${i + 1}/${processedChallans.length}`);
          }
        }

        console.log(
          `  ✅ Successfully seeded ${insertedCount} traffic challans`
        );

        // Print summary statistics
        const challanStats = await prisma.trafficChallan.groupBy({
          by: ["type"],
          _count: { type: true },
          _sum: { amount: true },
        });

        console.log("\n  📊 Traffic Challan Statistics:");
        challanStats.forEach((stat) => {
          console.log(
            `    ${stat.type}: ${stat._count.type} records, Total: ${stat._sum.amount} SAR`
          );
        });

        resolve();
      })
      .on("error", (error: Error) => {
        console.error("  ❌ Error reading CSV:", error);
        reject(error);
      });
  });
}
