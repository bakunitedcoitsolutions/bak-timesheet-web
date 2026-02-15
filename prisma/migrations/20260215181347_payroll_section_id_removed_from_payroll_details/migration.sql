/*
  Warnings:

  - You are about to drop the column `payrollSectionId` on the `PayrollDetails` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PayrollDetails" DROP CONSTRAINT "PayrollDetails_payrollSectionId_fkey";

-- AlterTable
ALTER TABLE "PayrollDetails" DROP COLUMN "payrollSectionId";
