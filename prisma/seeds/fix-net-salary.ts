import { PrismaClient } from "../generated/prisma/client";
import * as fs from "fs";
import * as path from "path";
import { calculatePayroll } from "../../src/utils/dummy";

export async function fixNetSalary(prisma: PrismaClient) {
  console.log("🌱 Starting fix for Net Salary from JSON data...");

  const jsonPath = path.join(process.cwd(), "data", "to-fix-net.json");
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON file not found at ${jsonPath}`);
    return;
  }

  const jsonRaw = fs.readFileSync(jsonPath, "utf-8");
  const parsedData = JSON.parse(jsonRaw);

  if (!Array.isArray(parsedData) || parsedData.length === 0) {
    console.log("No records to process.");
    return;
  }

  // Calculate the new values using the provided function
  const calculatedRows = calculatePayroll(parsedData);

  const updates: any[] = [];

  for (const row of calculatedRows) {
    updates.push(
      prisma.payrollDetails.update({
        where: { id: row.id },
        data: {
          netLoan: row.netLoan,
          netChallan: row.netChallan,
          netSalaryPayable: row.netSalaryPayable,
          cardSalary: row.cardSalary,
          cashSalary: row.cashSalary,
        },
      })
    );
  }

  console.log(`⏳ Executing ${updates.length} updates in transaction...`);

  // Execute updates in batches to avoid overwhelming the database connection limit
  const chunkSize = 50;
  let updatedCount = 0;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    await Promise.all(chunk);
    updatedCount += chunk.length;
  }

  console.log(`✅ Update complete! Total records updated: ${updatedCount}`);
}
