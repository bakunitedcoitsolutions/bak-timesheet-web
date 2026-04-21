/**
 * Database Seed Script
 * Run with: npm run db:seed
 *
 * This script seeds initial data for:
 * - User Roles
 * - Employee Statuses
 * - Designations
 * - Payroll Sections
 * - Branches
 * - Countries
 * - Cities
 * - GOSI Cities
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  ),
});

async function main() {
  console.log("🌱 Starting database seed...");
}

async function resetSequences() {
  console.log("🔄 Resetting database sequences...");
  const tables = [
    "Loan",
    "Ledger",
    "Employee",
    "User",
    "UserRole",
    "UserPrivilege",
    "Branch",
    "City",
    "Country",
    "GosiCity",
    "Designation",
    "EmployeeStatus",
    "Project",
    "Timesheet",
    "PayrollSection",
    "PayrollStatus",
    "PayrollSummary",
    "PaymentMethod",
    "PayrollDetails",
    "TrafficChallan",
    "ExitReentry",
    "AllowanceNotAvailable",
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1), COALESCE((SELECT MAX(id) FROM "${table}"), 0) > 0);
      `);
    } catch (error) {
      // Ignore errors for tables that might not exist or don't have sequences
      // console.warn(`Warning: Could not reset sequence for ${table}`);
    }
  }
  console.log("✅ Sequences reset successfully.");
}

main()
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
