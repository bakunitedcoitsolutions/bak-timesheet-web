/*
  Warnings:

  - You are about to drop the column `openingAdvanceBalance` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `openingTrafficViolationBalance` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "openingAdvanceBalance",
DROP COLUMN "openingTrafficViolationBalance";
