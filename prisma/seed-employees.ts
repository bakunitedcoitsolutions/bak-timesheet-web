import fs from "fs";
import path from "path";
import { PrismaClient } from "./generated/prisma/client";

/**
 * Helper function to generate a unique random employee code
 * Returns a random number between 1000000 and 2147483647 (PostgreSQL INTEGER max)
 */
const generateRandomEmployeeCode = (): number => {
  const timestampSeconds = Math.floor(Date.now() / 1000);
  const randomComponent = Math.floor(Math.random() * 1000000);
  const code = timestampSeconds + randomComponent;
  if (code > 2147483647) {
    return Math.floor(1000000 + Math.random() * 9000000);
  }
  return code;
};

const normalizeDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr || dateStr === "-") return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

const normalizeString = (str: string | null | undefined): string | null => {
  if (!str || str === "-") return null;
  return str;
};

export async function seedEmployees(prisma: PrismaClient) {
  console.log("👥 Seeding employees from Managed_Employee_Data.json...");

  const dataPath = path.join(process.cwd(), "Managed_Employee_Data.json");
  const employeesData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  console.log(`📊 Found ${employeesData.length} employees in JSON.`);

  let createdCount = 0;
  let reassignedCount = 0;

  for (const emp of employeesData) {
    const code = parseInt(emp.employeeCode);
    if (isNaN(code)) {
      console.warn(`⚠️ Skipping employee with invalid code: ${emp.employeeCode}`);
      continue;
    }

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Check for collision
        const existing = await tx.employee.findUnique({
          where: { employeeCode: code },
          select: { id: true, nameEn: true },
        });

        if (existing) {
          const newRandomCode = generateRandomEmployeeCode();
          await tx.employee.update({
            where: { id: existing.id },
            data: { employeeCode: newRandomCode },
          });
          reassignedCount++;
          console.log(`🔄 Reassigned conflicting code ${code} from existing employee "${existing.nameEn}" (ID: ${existing.id}) to ${newRandomCode}`);
        }

        // 2. Create the new employee
        await tx.employee.create({
          data: {
            employeeCode: code,
            nameEn: emp.nameEn,
            nameAr: normalizeString(emp.nameAr),
            gender: normalizeString(emp.gender),
            dob: normalizeDate(emp.dob),
            idCardNo: normalizeString(emp.idCardNo),
            idCardDocument: normalizeString(emp.idCardDocument),
            profession: normalizeString(emp.profession),
            nationalityId: emp.nationalityId,
            countryId: emp.countryId,
            passportNo: normalizeString(emp.passportNo),
            passportExpiryDate: normalizeDate(emp.passportExpiryDate),
            branchId: emp.branchId,
            designationId: emp.designationId,
            payrollSectionId: emp.payrollSectionId,
            // Defaults for other required fields if any (schema showed most are optional)
            hourlyRate: 0, // Schema: Decimal @db.Decimal(10, 2)
          },
        });
        createdCount++;
        if (createdCount % 100 === 0) {
          console.log(`✅ Processed ${createdCount} employees...`);
        }
      });
    } catch (error) {
      console.error(`❌ Error seeding employee ${emp.nameEn} (Code: ${code}):`, error);
    }
  }

  console.log(`✨ Seeding completed:`);
  console.log(`   - Total processed: ${createdCount}`);
  console.log(`   - Total reassigned: ${reassignedCount}`);
}
