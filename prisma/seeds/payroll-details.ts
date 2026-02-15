const fs = require("fs");
const path = require("path");
// Const prisma import commented out as we pass it as arg usually in seed files here
// import { PrismaClient } from "../generated/prisma/client";

/**
 * Seed Payroll Details Data
 * Reads from prisma/payroll-details-data.json and seeds the PayrollDetails table.
 */

export async function seedPayrollDetails(prisma: any) {
  console.log("🌱 Seeding Payroll Details...");

  const dataPath = path.join(__dirname, "../payroll-details-data.json");

  if (!fs.existsSync(dataPath)) {
    console.warn("⚠️ payroll-details-data.json not found. Skipping Payroll Details seeding.");
    return;
  }

  // Read file - might be large, so we could stream or just read if 16MB is fine (20k lines * ~200 bytes = ~4MB, should be fine)
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const details = JSON.parse(rawData);

  console.log(`Found ${details.length} payroll detail records to seed.`);

  let createdCount = 0;
  let errorCount = 0;
  
  // Batch processing to avoid overwhelming DB connection if many records
  const BATCH_SIZE = 100;
  
  for (let i = 0; i < details.length; i += BATCH_SIZE) {
    const batch = details.slice(i, i + BATCH_SIZE);
    
    // Using transaction for batch speed if possible, or just parallel promises
    // Upsert is safer.
    
    const promises = batch.map(async (detail: any) => {
        try {
            if (detail.id) {
                await prisma.payrollDetails.upsert({
                    where: { id: detail.id },
                    update: detail,
                    create: detail,
                });
            } else {
                // If no ID, try to find unique alternate? 
                // PayrollDetails unique constraint? Usually payrollId + employeeId
                // Let's assume we want to avoid dups.
                const existing = await prisma.payrollDetails.findFirst({
                    where: {
                        payrollId: detail.payrollId,
                        employeeId: detail.employeeId
                    },
                    select: { id: true }
                });
                
                if (existing) {
                    await prisma.payrollDetails.update({
                        where: { id: existing.id },
                        data: detail
                    });
                } else {
                    await prisma.payrollDetails.create({
                        data: detail
                    });
                }
            }
            return true;
        } catch (error: any) {
            console.error(`❌ Failed to seed payroll detail for Emp ID ${detail.employeeId}:`, error.message);
            return false;
        }
    });
    
    const results = await Promise.all(promises);
    const success = results.filter(r => r).length;
    createdCount += success;
    errorCount += (results.length - success);
    
    if ((i + BATCH_SIZE) % 1000 === 0) {
        console.log(` ... Processed ${i + BATCH_SIZE} / ${details.length}`);
    }
  }

  console.log(`✅ Payroll Details Seeding completed: ${createdCount} created/updated, ${errorCount} failed.`);
}
