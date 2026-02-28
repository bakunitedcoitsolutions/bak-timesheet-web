/*
  Warnings:

  - You are about to alter the column `salary` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `foodAllowance` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `mobileAllowance` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `otherAllowance` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `amount` on the `Ledger` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `balance` on the `Ledger` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `amount` on the `Loan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalHours` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `salary` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `previousLoan` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `currentLoan` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `netLoan` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `netSalaryPayable` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `cardSalary` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `cashSalary` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `overTime` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `breakfastAllowance` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `otherAllowances` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalAllowances` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `challanDeduction` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `currentChallan` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `loanDeduction` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `netChallan` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `previousChallan` on the `PayrollDetails` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalSalary` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalNetLoan` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalNetSalaryPayable` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalCardSalary` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalCashSalary` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalCurrentChallan` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalCurrentLoan` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalNetChallan` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalPreviousChallan` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalPreviousLoan` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalBreakfastAllowance` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalChallanDeduction` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalLoanDeduction` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalOtherAllowances` on the `PayrollSummary` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `amount` on the `TrafficChallan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - Made the column `hourlyRate` on table `Employee` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "hourlyRate" SET NOT NULL,
ALTER COLUMN "salary" SET DATA TYPE INTEGER,
ALTER COLUMN "foodAllowance" SET DATA TYPE INTEGER,
ALTER COLUMN "mobileAllowance" SET DATA TYPE INTEGER,
ALTER COLUMN "otherAllowance" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Ledger" ALTER COLUMN "amount" SET DATA TYPE INTEGER,
ALTER COLUMN "balance" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Loan" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "PayrollDetails" ALTER COLUMN "totalHours" SET DATA TYPE INTEGER,
ALTER COLUMN "salary" SET DATA TYPE INTEGER,
ALTER COLUMN "previousLoan" SET DATA TYPE INTEGER,
ALTER COLUMN "currentLoan" SET DATA TYPE INTEGER,
ALTER COLUMN "netLoan" SET DATA TYPE INTEGER,
ALTER COLUMN "netSalaryPayable" SET DATA TYPE INTEGER,
ALTER COLUMN "cardSalary" SET DATA TYPE INTEGER,
ALTER COLUMN "cashSalary" SET DATA TYPE INTEGER,
ALTER COLUMN "overTime" SET DATA TYPE INTEGER,
ALTER COLUMN "breakfastAllowance" SET DATA TYPE INTEGER,
ALTER COLUMN "otherAllowances" SET DATA TYPE INTEGER,
ALTER COLUMN "totalAllowances" SET DATA TYPE INTEGER,
ALTER COLUMN "challanDeduction" SET DATA TYPE INTEGER,
ALTER COLUMN "currentChallan" SET DATA TYPE INTEGER,
ALTER COLUMN "loanDeduction" SET DATA TYPE INTEGER,
ALTER COLUMN "netChallan" SET DATA TYPE INTEGER,
ALTER COLUMN "previousChallan" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "PayrollSummary" ALTER COLUMN "totalSalary" SET DATA TYPE INTEGER,
ALTER COLUMN "totalNetLoan" SET DATA TYPE INTEGER,
ALTER COLUMN "totalNetSalaryPayable" SET DATA TYPE INTEGER,
ALTER COLUMN "totalCardSalary" SET DATA TYPE INTEGER,
ALTER COLUMN "totalCashSalary" SET DATA TYPE INTEGER,
ALTER COLUMN "totalCurrentChallan" SET DATA TYPE INTEGER,
ALTER COLUMN "totalCurrentLoan" SET DATA TYPE INTEGER,
ALTER COLUMN "totalNetChallan" SET DATA TYPE INTEGER,
ALTER COLUMN "totalPreviousChallan" SET DATA TYPE INTEGER,
ALTER COLUMN "totalPreviousLoan" SET DATA TYPE INTEGER,
ALTER COLUMN "totalBreakfastAllowance" SET DATA TYPE INTEGER,
ALTER COLUMN "totalChallanDeduction" SET DATA TYPE INTEGER,
ALTER COLUMN "totalLoanDeduction" SET DATA TYPE INTEGER,
ALTER COLUMN "totalOtherAllowances" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "TrafficChallan" ALTER COLUMN "amount" SET DATA TYPE INTEGER;
