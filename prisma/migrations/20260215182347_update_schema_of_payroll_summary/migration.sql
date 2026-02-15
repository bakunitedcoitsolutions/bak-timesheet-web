/*
  Warnings:

  - You are about to drop the column `totalCurrentAdvance` on the `PayrollSummary` table. All the data in the column will be lost.
  - You are about to drop the column `totalDeduction` on the `PayrollSummary` table. All the data in the column will be lost.
  - You are about to drop the column `totalPreviousAdvance` on the `PayrollSummary` table. All the data in the column will be lost.
  - Added the required column `totalCurrentChallan` to the `PayrollSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCurrentLoan` to the `PayrollSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDeductionChallan` to the `PayrollSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDeductionLoan` to the `PayrollSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalNetChallan` to the `PayrollSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPreviousChallan` to the `PayrollSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPreviousLoan` to the `PayrollSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PayrollSummary" DROP COLUMN "totalCurrentAdvance",
DROP COLUMN "totalDeduction",
DROP COLUMN "totalPreviousAdvance",
ADD COLUMN     "totalCurrentChallan" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalCurrentLoan" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalDeductionChallan" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalDeductionLoan" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalNetChallan" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalPreviousChallan" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalPreviousLoan" DECIMAL(10,2) NOT NULL;
