/**
 * Employee Loans Seed Script
 * Imports loan data from data/EmployeeLoans.csv
 */

import * as fs from "fs";
import * as path from "path";
import csv from "csv-parser";
import { PrismaClient, LoanType } from "../generated/prisma/client";

interface CSVLoanRow {
  Id: string;
  EmployeeId: string;
  TransactionDate: string;
  LoanAmount: string;
  DeductionAmount: string;
  Remarks: string;
}

interface ProcessedLoan {
  id: number;
  employeeId: number;
  date: Date;
  type: LoanType;
  amount: number;
  remarks: string | null;
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

export async function seedEmployeeLoans(prisma: PrismaClient) {
  const csvPath = path.join(__dirname, "../../data/EmployeeLoans.csv");

  console.log(`  � Reading from: ${csvPath}`);

  // Get all employee IDs to verify they exist
  const employees = await prisma.employee.findMany({
    select: { id: true },
  });

  const employeeIds = new Set(employees.map((emp) => emp.id));
  console.log(`  👥 Found ${employees.length} employees in database`);

  // Process and transform loan data
  const processedLoans: ProcessedLoan[] = [];
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
          const loanAmount = parseDecimal(row.LoanAmount);
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
          if (loanAmount === 0 && deductionAmount === 0) {
            console.warn(
              `  ⚠️  [SKIP] Both amounts are 0 for loan ID ${id} (Row ${processedCount})`
            );
            skippedCount++;
            return;
          }

          // Parse date
          const date = parseDate(row.TransactionDate);
          if (!date) {
            console.warn(
              `  ⚠️  [SKIP] Invalid date for loan ID ${id}: "${row.TransactionDate}" (Row ${processedCount})`
            );
            skippedCount++;
            return;
          }

          // Determine loan type and amount
          let type: LoanType;
          let amount: number;

          if (loanAmount > 0) {
            type = LoanType.LOAN;
            amount = loanAmount;
          } else if (deductionAmount > 0) {
            type = LoanType.RETURN;
            amount = deductionAmount;
          } else if (loanAmount < 0) {
            // Handle negative loan amounts as returns
            type = LoanType.RETURN;
            amount = Math.abs(loanAmount);
          } else {
            console.warn(
              `  ⚠️  [SKIP] No valid amount for loan ID ${id} (Row ${processedCount})`
            );
            skippedCount++;
            return;
          }

          // Check if employee exists
          if (!employeeIds.has(employeeId)) {
            console.warn(
              `  ⚠️  [SKIP] Employee ID ${employeeId} not found for loan ID ${id} (Row ${processedCount})`
            );
            missingEmployeeCount++;
            return;
          }

          processedLoans.push({
            id,
            employeeId,
            date,
            type,
            amount,
            remarks: cleanString(row.Remarks),
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
        console.log(`     Valid loans: ${processedLoans.length}`);
        console.log(`     Skipped: ${skippedCount}`);
        console.log(`     Missing employees: ${missingEmployeeCount}`);

        // Insert loans individually using upsert to preserve IDs
        let insertedCount = 0;

        for (let i = 0; i < processedLoans.length; i++) {
          const loan = processedLoans[i];

          await prisma.loan.upsert({
            where: { id: loan.id },
            update: {
              employeeId: loan.employeeId,
              date: loan.date,
              type: loan.type,
              amount: loan.amount,
              remarks: loan.remarks,
            },
            create: {
              id: loan.id,
              employeeId: loan.employeeId,
              date: loan.date,
              type: loan.type,
              amount: loan.amount,
              remarks: loan.remarks,
            },
          });

          insertedCount++;

          if (
            i === 0 ||
            (i + 1) % 100 === 0 ||
            i === processedLoans.length - 1
          ) {
            console.log(`  💾 Inserting: ${i + 1}/${processedLoans.length}`);
          }
        }

        console.log(`  ✅ Successfully seeded ${insertedCount} employee loans`);

        // Print summary statistics
        const loanStats = await prisma.loan.groupBy({
          by: ["type"],
          _count: { type: true },
          _sum: { amount: true },
        });

        console.log("\n  📊 Loan Statistics:");
        loanStats.forEach((stat) => {
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
