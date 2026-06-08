import fs from "fs";
import path from "path";
import { PrismaClient, ExitReentryType } from "./generated/prisma/client";

const normalizeDate = (dateStr: any): Date | null => {
  if (!dateStr || dateStr === "-" || String(dateStr).trim() === "") return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

const normalizeString = (str: any): string | null => {
  if (str === undefined || str === null) return null;
  const s = String(str).trim();
  if (s === "" || s === "-") return null;
  return s;
};

const normalizeInt = (val: any): number | null => {
  if (
    val === undefined ||
    val === null ||
    String(val).trim() === "" ||
    String(val).trim() === "-"
  )
    return null;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? null : parsed;
};

const normalizeBoolean = (val: any): boolean => {
  if (val === true || String(val).trim().toLowerCase() === "true") return true;
  return false;
};

export async function seedEmployees(prisma: PrismaClient) {
  console.log(
    "👥 Seeding employees from bulk-update/HR-2026-New-06-06-2026 - Final.json..."
  );

  const dataPath = path.join(
    process.cwd(),
    "bulk-update",
    "HR-2026-New-06-06-2026 - Final.json"
  );
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Data file not found at: ${dataPath}`);
  }

  const employeesData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  console.log(`📊 Found ${employeesData.length} employees in JSON.`);

  let updatedCount = 0;

  for (const emp of employeesData) {
    const code = normalizeInt(emp.employeeCode);
    if (code === null) {
      console.warn(
        `⚠️ Skipping employee with invalid code: ${emp.employeeCode}`
      );
      continue;
    }

    const employeeData = {
      nameEn: normalizeString(emp.nameEn) || "Unknown",
      nameAr: normalizeString(emp.nameAr),
      dob: normalizeDate(emp.dob),
      phone: normalizeString(emp.phone),
      gender: normalizeString(emp.gender),
      countryId: normalizeInt(emp.countryId),
      cityId: normalizeInt(emp.cityId),
      statusId: normalizeInt(emp.statusId),
      branchId: normalizeInt(emp.branchId),
      designationId: normalizeInt(emp.designationId),
      payrollSectionId: normalizeInt(emp.payrollSectionId),
      isDeductable: normalizeBoolean(emp.isDeductable),
      isFixed: normalizeBoolean(emp.isFixed),
      workingDays: normalizeInt(emp.workingDays),
      hourlyRate: emp.hourlyRate !== undefined ? Number(emp.hourlyRate) : 0,
      salary: normalizeInt(emp.salary),
      breakfastAllowance: normalizeBoolean(emp.breakfastAllowance),
      foodAllowance: normalizeInt(emp.foodAllowance),
      mobileAllowance: normalizeInt(emp.mobileAllowance),
      otherAllowance: normalizeInt(emp.otherAllowance),
      contractStartDate: normalizeDate(emp.contractStartDate),
      contractEndDate: normalizeDate(emp.contractEndDate),
      contractEndReason: normalizeString(emp.contractEndReason),
      joiningDate: normalizeDate(emp.joiningDate),
      idCardNo: normalizeString(emp.idCardNo),
      idCardExpiryDate: normalizeDate(emp.idCardExpiryDate),
      profession: normalizeString(emp.profession),
      nationalityId: normalizeInt(emp.nationalityId),
      passportNo: normalizeString(emp.passportNo),
      passportExpiryDate: normalizeDate(emp.passportExpiryDate),
      bankName: normalizeString(emp.bankName),
      bankCode: normalizeString(emp.bankCode),
      iban: normalizeString(emp.iban),
      gosiSalary: normalizeInt(emp.gosiSalary),
      gosiCityId: normalizeInt(emp.gosiCityId),
      lastEntryDate: normalizeDate(emp.lastEntryDate),
    };

    try {
      const existing = await prisma.employee.findUnique({
        where: { employeeCode: code },
        select: { id: true },
      });

      if (existing) {
        const updated = await prisma.employee.update({
          where: { employeeCode: code },
          data: employeeData,
        });
        updatedCount++;

        if (employeeData.lastEntryDate) {
          const existingEntry = await prisma.exitReentry.findFirst({
            where: {
              employeeId: updated.id,
              date: employeeData.lastEntryDate,
              type: ExitReentryType.ENTRY,
            },
          });

          if (!existingEntry) {
            await prisma.exitReentry.create({
              data: {
                employeeId: updated.id,
                designationId: employeeData.designationId,
                date: employeeData.lastEntryDate,
                type: ExitReentryType.ENTRY,
                remarks: "Initial Entry Date from Seed",
              },
            });
            console.log(
              `✈️ Created new ENTRY record for ${updated.nameEn} (Code: ${code}) on date: ${emp.lastEntryDate}`
            );
          } else {
            console.log(
              `ℹ️ ENTRY record already exists for ${updated.nameEn} (Code: ${code}) on date: ${emp.lastEntryDate}`
            );
          }
        }
      } else {
        console.warn(`⚠️ Employee not found in database for code: ${code}`);
      }
    } catch (error) {
      console.error(
        `❌ Error updating employee ${emp.nameEn} (Code: ${code}):`,
        error
      );
    }
  }

  console.log(`✨ Seeding completed:`);
  console.log(`   - Total processed: ${employeesData.length}`);
  console.log(`   - Successfully updated: ${updatedCount}`);
}
