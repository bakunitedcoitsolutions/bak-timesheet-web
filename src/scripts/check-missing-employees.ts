import "dotenv/config";
import { prisma } from "../lib/db/prisma";

const empCodes = [
  54001, 21009, 20005, 20012, 30024, 50003, 50005, 90024, 40071, 90512, 40119,
  90496, 50011, 30016, 90521, 90358, 30050, 90147, 30011, 55051, 55004, 90558,
  40115, 90700, 90725, 90746, 90595, 90733, 90696, 90728, 30071, 90744, 21022,
];

async function main() {
  console.log(`Checking ${empCodes.length} employee codes...`);

  const existingEmployees = await prisma.employee.findMany({
    where: {
      employeeCode: {
        in: empCodes,
      },
    },
    select: {
      employeeCode: true,
    },
  });

  const existingCodes = new Set(existingEmployees.map((e) => e.employeeCode));
  const missingCodes = empCodes.filter((code) => !existingCodes.has(code));

  console.log(`\nFound ${existingCodes.size} existing employees.`);
  console.log(`Found ${missingCodes.length} missing employees.`);

  if (missingCodes.length > 0) {
    console.log("\n❌ MISSING EMPLOYEE CODES:");
    console.log(missingCodes.join(", "));
  } else {
    console.log("\n✅ All employee codes exist in the database.");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
