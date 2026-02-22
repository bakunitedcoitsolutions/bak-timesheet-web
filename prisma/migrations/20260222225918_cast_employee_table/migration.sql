/*
  Warnings:

  - You are about to drop the column `openingBalance` on the `Employee` table. All the data in the column will be lost.
  - You are about to alter the column `hourlyRate` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,1)` to `Decimal(10,2)`.
  - You are about to alter the column `salary` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,1)` to `Decimal(10,2)`.
  - You are about to alter the column `foodAllowance` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,1)` to `Decimal(10,2)`.
  - You are about to alter the column `mobileAllowance` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,1)` to `Decimal(10,2)`.
  - You are about to alter the column `otherAllowance` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,1)` to `Decimal(10,2)`.
  - You are about to alter the column `gosiSalary` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,1)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "openingBalance",
ADD COLUMN     "openingAdvanceBalance" DECIMAL(10,2),
ADD COLUMN     "openingTrafficViolationBalance" DECIMAL(10,2),
ALTER COLUMN "hourlyRate" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "salary" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "foodAllowance" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "mobileAllowance" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "otherAllowance" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "gosiSalary" SET DATA TYPE DECIMAL(10,2);
