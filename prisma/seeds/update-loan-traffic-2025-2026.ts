import { PrismaClient } from "../generated/prisma/client";
import * as fs from "fs";
import * as path from "path";

function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let value = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          value += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        value += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(value);
        value = "";
      } else if (char === "\n") {
        row.push(value);
        result.push(row);
        row = [];
        value = "";
      } else if (char !== "\r") {
        value += char;
      }
    }
  }
  if (value || text[text.length - 1] === ",") row.push(value);
  if (row.length > 0) result.push(row);
  return result;
}

const parseAmount = (val: string) => {
  if (!val) return 0;
  const clean = val.replace(/,/g, "").trim();
  const num = parseInt(clean, 10);
  return isNaN(num) ? 0 : num;
};

export async function updateLoanAndTraffic(prisma: PrismaClient) {
  console.log("🌱 Starting update for Loan and Traffic balances...");

  const csvPath = path.join(
    process.cwd(),
    "data",
    "Previous Loan and Traffic Jan-2026.csv"
  );
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at ${csvPath}`);
    return;
  }

  const csvVal = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(csvVal);

  let updatedDec = 0;
  let updatedJan = 0;
  let notFoundEmployees = 0;

  // Collect all employee codes to fetch data in bulk
  const employeeCodesToProcess = new Set<number>();
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 7) continue;

    const codeStr = row[1];
    if (!codeStr || codeStr.toLowerCase() === "total:" || codeStr === "")
      continue;

    const employeeCode = parseInt(codeStr.trim(), 10);
    if (!isNaN(employeeCode)) {
      employeeCodesToProcess.add(employeeCode);
    }
  }

  // Fetch all employees in one query
  const employees = await prisma.employee.findMany({
    where: { employeeCode: { in: Array.from(employeeCodesToProcess) } },
    select: { id: true, employeeCode: true },
  });

  const employeeMap = new Map<number, number>();
  for (const emp of employees) {
    employeeMap.set(emp.employeeCode, emp.id);
  }

  // Fetch all relevant payroll details in one query
  const payrollDetails = await prisma.payrollDetails.findMany({
    where: {
      employeeId: { in: Array.from(employeeMap.values()) },
      OR: [
        { payrollMonth: 12, payrollYear: 2025 },
        { payrollMonth: 1, payrollYear: 2026 },
      ],
    },
    select: {
      id: true,
      employeeId: true,
      payrollMonth: true,
      payrollYear: true,
      currentLoan: true,
      currentChallan: true,
    },
  });

  // Build maps for quick lookup: Map<employeeId, PayrollDetail>
  const decMap = new Map<number, any>();
  const janMap = new Map<number, any>();

  for (const detail of payrollDetails) {
    if (detail.payrollMonth === 12 && detail.payrollYear === 2025) {
      decMap.set(detail.employeeId, detail);
    } else if (detail.payrollMonth === 1 && detail.payrollYear === 2026) {
      janMap.set(detail.employeeId, detail);
    }
  }

  const updates: any[] = [];

  // Row 0 is the title, Row 1 is the header
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 7) continue;

    const codeStr = row[1];
    if (!codeStr || codeStr.toLowerCase() === "total:" || codeStr === "")
      continue;

    const employeeCode = parseInt(codeStr.trim(), 10);
    if (isNaN(employeeCode)) continue;

    const netLoan = parseAmount(row[5]);
    const netTraffic = parseAmount(row[6]); // Called NetChallan/NetTraffic

    const employeeId = employeeMap.get(employeeCode);

    if (!employeeId) {
      console.warn(`⚠️ Employee not found for code: ${employeeCode}`);
      notFoundEmployees++;
      continue;
    }

    // Dec 2025 -> Update netLoan and netChallan
    const decDetails = decMap.get(employeeId);

    if (decDetails) {
      updates.push(
        prisma.payrollDetails.update({
          where: { id: decDetails.id },
          data: { netLoan, netChallan: netTraffic },
        })
      );
      // Also update the summary tables or other dependent fields if needed.
      // But typically, net deductions are computed, or here overwritten directly.
      updatedDec++;
    } else {
      console.log(`ℹ️ No Dec 2025 payroll record for ${employeeCode}`);
    }

    // Jan 2026 -> Update previousLoan and previousChallan
    const janDetails = janMap.get(employeeId);

    if (janDetails) {
      const janPreviousLoan = netLoan;
      const janCurrentLoan = Number(janDetails.currentLoan ?? 0);
      const updatedNetLoan = janPreviousLoan + janCurrentLoan;

      const janPreviousTraffic = netTraffic;
      const janCurrentTraffic = Number(janDetails.currentChallan ?? 0);
      const updatedNetTraffic = janPreviousTraffic + janCurrentTraffic;

      updates.push(
        prisma.payrollDetails.update({
          where: { id: janDetails.id },
          data: {
            previousLoan: janPreviousLoan,
            netLoan: updatedNetLoan,

            //
            previousChallan: janPreviousTraffic,
            netChallan: updatedNetTraffic,
          },
        })
      );
      updatedJan++;
    } else {
      console.log(`ℹ️ No Jan 2026 payroll record for ${employeeCode}`);
    }
  }

  // Execute all updates in chunks for optimal performance
  console.log(`⏳ Executing ${updates.length} updates...`);
  const chunkSize = 50;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    await Promise.all(chunk);
  }

  console.log(`✅ Update complete!`);
  console.log(`📊 Dec 2025 updated records: ${updatedDec}`);
  console.log(`📊 Jan 2026 updated records: ${updatedJan}`);
  if (notFoundEmployees > 0) {
    console.log(`⚠️ Employees not found in DB: ${notFoundEmployees}`);
  }
}
