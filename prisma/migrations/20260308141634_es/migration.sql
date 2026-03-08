/*
  Warnings:

  - You are about to drop the column `isLocked` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `isLocked` on the `ExitReentry` table. All the data in the column will be lost.
  - You are about to drop the column `isLocked` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the column `isLocked` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `isLocked` on the `TrafficChallan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "isLocked";

-- AlterTable
ALTER TABLE "ExitReentry" DROP COLUMN "isLocked";

-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "isLocked";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "isLocked";

-- AlterTable
ALTER TABLE "TrafficChallan" DROP COLUMN "isLocked";
