/*
  Warnings:

  - You are about to alter the column `gosiSalary` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `openingAdvanceBalance` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `openingTrafficViolationBalance` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "gosiSalary" SET DATA TYPE INTEGER,
ALTER COLUMN "openingAdvanceBalance" SET DATA TYPE INTEGER,
ALTER COLUMN "openingTrafficViolationBalance" SET DATA TYPE INTEGER;
