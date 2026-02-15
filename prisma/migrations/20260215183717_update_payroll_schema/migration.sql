/*
  Warnings:

  - You are about to drop the column `currentTrafficChallan` on the `PayrollDetails` table. All the data in the column will be lost.
  - You are about to drop the column `deductionLoan` on the `PayrollDetails` table. All the data in the column will be lost.
  - You are about to drop the column `deductionTrafficChallan` on the `PayrollDetails` table. All the data in the column will be lost.
  - You are about to drop the column `netTrafficChallan` on the `PayrollDetails` table. All the data in the column will be lost.
  - You are about to drop the column `previousTrafficChallan` on the `PayrollDetails` table. All the data in the column will be lost.
  - You are about to drop the column `totalDeductionChallan` on the `PayrollSummary` table. All the data in the column will be lost.
  - You are about to drop the column `totalDeductionLoan` on the `PayrollSummary` table. All the data in the column will be lost.
  - Added the required column `challanDeduction` to the `PayrollDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentChallan` to the `PayrollDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loanDeduction` to the `PayrollDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netChallan` to the `PayrollDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousChallan` to the `PayrollDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalBreakfastAllowance` to the `PayrollSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalChallanDeduction` to the `PayrollSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalLoanDeduction` to the `PayrollSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalOtherAllowances` to the `PayrollSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PayrollDetails" DROP COLUMN "currentTrafficChallan",
DROP COLUMN "deductionLoan",
DROP COLUMN "deductionTrafficChallan",
DROP COLUMN "netTrafficChallan",
DROP COLUMN "previousTrafficChallan",
ADD COLUMN     "challanDeduction" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "currentChallan" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "loanDeduction" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "netChallan" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "previousChallan" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "PayrollSummary" DROP COLUMN "totalDeductionChallan",
DROP COLUMN "totalDeductionLoan",
ADD COLUMN     "totalBreakfastAllowance" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalChallanDeduction" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalLoanDeduction" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalOtherAllowances" DECIMAL(10,2) NOT NULL;
