/*
  Warnings:

  - You are about to drop the `Ledger` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ledger" DROP CONSTRAINT "Ledger_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Ledger" DROP CONSTRAINT "Ledger_loanId_fkey";

-- DropForeignKey
ALTER TABLE "Ledger" DROP CONSTRAINT "Ledger_payrollDetailId_fkey";

-- DropForeignKey
ALTER TABLE "Ledger" DROP CONSTRAINT "Ledger_trafficChallanId_fkey";

-- DropTable
DROP TABLE "Ledger";

-- DropEnum
DROP TYPE "AmountType";

-- DropEnum
DROP TYPE "LedgerType";
