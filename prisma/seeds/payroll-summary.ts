const fs = require("fs");
const path = require("path");

/**
 * Seed Payroll Summary Data
 * Reads from prisma/payroll-summary-data.json and seeds the PayrollSummary table.
 */

export async function seedPayrollSummary(prisma: any) {
  console.log("🌱 Seeding Payroll Summary...");

  const dataPath = path.join(__dirname, "../payroll-summary-data.json");

  if (!fs.existsSync(dataPath)) {
    console.warn(
      "⚠️ payroll-summary-data.json not found. Skipping Payroll Summary seeding."
    );
    return;
  }

  const rawData = fs.readFileSync(dataPath, "utf-8");
  const summaries = JSON.parse(rawData);

  console.log(`Found ${summaries.length} payroll summary records to seed.`);

  let createdCount = 0;
  let errorCount = 0;

  for (const summary of summaries) {
    try {
      // Upsert based on unique constraint (e.g., ID if preserved, or month/year/branch?)
      // Since we preserved IDs in transformation, we can upsert by ID.
      // If ID is present, use it.

      if (summary.id) {
        await prisma.payrollSummary.upsert({
          where: { id: summary.id },
          update: summary,
          create: summary,
        });
      } else {
        // Fallback if no ID (shouldn't happen based on script)
        // Assuming we want to avoid duplicates based on month/year/branch if ID is missing?
        // For now, let's just create if no ID, or maybe findFirst to check existence.
        // But our transform script preserves IDs.
        await prisma.payrollSummary.create({
          data: summary,
        });
      }

      createdCount++;
    } catch (error: any) {
      console.error(
        `❌ Failed to seed payroll summary ID ${summary.id}:`,
        error.message
      );
      errorCount++;
    }
  }

  console.log(
    `✅ Payroll Summary Seeding completed: ${createdCount} created/updated, ${errorCount} failed.`
  );
}
