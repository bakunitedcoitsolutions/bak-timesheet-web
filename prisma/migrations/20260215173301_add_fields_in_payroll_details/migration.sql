/*
  Warnings:

  - You are about to drop the column `allowance` on the `PayrollDetails` table. All the data in the column will be lost.
  - Added the required column `breakfastAllowance` to the `PayrollDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otherAllowances` to the `PayrollDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAllowances` to the `PayrollDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PayrollDetails" DROP COLUMN "allowance",
ADD COLUMN     "breakfastAllowance" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otherAllowances" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalAllowances" DECIMAL(10,2) NOT NULL;
