/**
 * update-employee-rates.js
 *
 * Reads data/FixedEmployeeRates.csv and updates the `hourlyRate` and `salary`
 * fields for each employee matched by the `id` column.
 *
 * Run with:
 *   node prisma/update-employee-rates.js
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

/**
 * Parse a numeric string that may contain commas and/or surrounding quotes.
 * e.g. ' 45,000 ' → 45000   |   ' 187.50 ' → 187.50
 */
function parseNum(str) {
  if (!str) return null;
  const cleaned = str.toString().replace(/[",\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

async function main() {
  const csvPath = path.resolve(__dirname, "../data/FixedEmployeeRates.csv");
  const content = fs.readFileSync(csvPath, "utf8");

  // Parse CSV lines
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  const idIdx = headers.indexOf("id");
  const hrIdx = headers.indexOf("hourlyrate");
  const salIdx = headers.indexOf("salary");

  if (idIdx === -1 || hrIdx === -1 || salIdx === -1) {
    throw new Error(
      `Missing expected columns. Found headers: ${headers.join(", ")}`
    );
  }

  // Build records from data rows — handle quoted values with commas inside
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Simple quoted-CSV parser
    const cols = [];
    let inQuote = false;
    let cur = "";
    for (const ch of line) {
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        cols.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur);

    const id = parseInt(cols[idIdx]?.trim(), 10);
    const hourlyRate = parseNum(cols[hrIdx]);
    const salary = parseNum(cols[salIdx]);

    if (isNaN(id)) {
      console.warn(`  [Row ${i + 1}] Skipping — invalid id: ${cols[idIdx]}`);
      continue;
    }
    if (hourlyRate === null && salary === null) {
      console.warn(
        `  [Row ${i + 1}] Skipping — both hourlyRate and salary are null for id=${id}`
      );
      continue;
    }

    records.push({ id, hourlyRate, salary });
  }

  console.log(`\nParsed ${records.length} employee records from CSV.\n`);

  let updated = 0;
  let notFound = 0;

  for (const rec of records) {
    const employee = await prisma.employee.findUnique({
      where: { id: rec.id },
      select: { id: true, nameEn: true },
    });

    if (!employee) {
      console.warn(`  [id=${rec.id}] NOT FOUND in database — skipped`);
      notFound++;
      continue;
    }

    await prisma.employee.update({
      where: { id: rec.id },
      data: {
        hourlyRate: rec.hourlyRate,
        salary: rec.salary,
      },
    });

    console.log(
      `  [id=${rec.id}] Updated "${employee.nameEn}" → hourlyRate=${rec.hourlyRate}, salary=${rec.salary}`
    );
    updated++;
  }

  console.log(`\n✅ Done — ${updated} updated, ${notFound} not found.\n`);
}

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
