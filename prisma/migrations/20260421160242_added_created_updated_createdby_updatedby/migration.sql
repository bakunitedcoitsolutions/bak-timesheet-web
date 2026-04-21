/*
  Warnings:

  - You are about to drop the column `createdDate` on the `PayrollDetails` table. All the data in the column will be lost.
  - You are about to drop the column `modifiedBy` on the `PayrollDetails` table. All the data in the column will be lost.
  - You are about to drop the column `modifiedDate` on the `PayrollDetails` table. All the data in the column will be lost.
  - You are about to drop the column `createdDate` on the `PayrollSummary` table. All the data in the column will be lost.
  - You are about to drop the column `modifiedBy` on the `PayrollSummary` table. All the data in the column will be lost.
  - You are about to drop the column `modifiedDate` on the `PayrollSummary` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PayrollDetails" DROP CONSTRAINT "PayrollDetails_modifiedBy_fkey";

-- DropForeignKey
ALTER TABLE "PayrollSummary" DROP CONSTRAINT "PayrollSummary_modifiedBy_fkey";

-- DropIndex
DROP INDEX "PayrollDetails_modifiedBy_idx";

-- DropIndex
DROP INDEX "PayrollSummary_modifiedBy_idx";

-- AlterTable
ALTER TABLE "AllowanceNotAvailable" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "City" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Designation" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "EmployeeStatus" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ExitReentry" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "GosiCity" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PayrollDetails" DROP COLUMN "createdDate",
DROP COLUMN "modifiedBy",
DROP COLUMN "modifiedDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedBy" INTEGER;

-- AlterTable
ALTER TABLE "PayrollSection" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PayrollStatus" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PayrollSummary" DROP COLUMN "createdDate",
DROP COLUMN "modifiedBy",
DROP COLUMN "modifiedDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedBy" INTEGER;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Timesheet" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TrafficChallan" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserPrivilege" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "updatedBy" INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "AllowanceNotAvailable_createdBy_idx" ON "AllowanceNotAvailable"("createdBy");

-- CreateIndex
CREATE INDEX "AllowanceNotAvailable_updatedBy_idx" ON "AllowanceNotAvailable"("updatedBy");

-- CreateIndex
CREATE INDEX "Branch_createdBy_idx" ON "Branch"("createdBy");

-- CreateIndex
CREATE INDEX "Branch_updatedBy_idx" ON "Branch"("updatedBy");

-- CreateIndex
CREATE INDEX "City_createdBy_idx" ON "City"("createdBy");

-- CreateIndex
CREATE INDEX "City_updatedBy_idx" ON "City"("updatedBy");

-- CreateIndex
CREATE INDEX "Country_createdBy_idx" ON "Country"("createdBy");

-- CreateIndex
CREATE INDEX "Country_updatedBy_idx" ON "Country"("updatedBy");

-- CreateIndex
CREATE INDEX "Designation_createdBy_idx" ON "Designation"("createdBy");

-- CreateIndex
CREATE INDEX "Designation_updatedBy_idx" ON "Designation"("updatedBy");

-- CreateIndex
CREATE INDEX "Employee_createdBy_idx" ON "Employee"("createdBy");

-- CreateIndex
CREATE INDEX "Employee_updatedBy_idx" ON "Employee"("updatedBy");

-- CreateIndex
CREATE INDEX "EmployeeStatus_createdBy_idx" ON "EmployeeStatus"("createdBy");

-- CreateIndex
CREATE INDEX "EmployeeStatus_updatedBy_idx" ON "EmployeeStatus"("updatedBy");

-- CreateIndex
CREATE INDEX "ExitReentry_createdBy_idx" ON "ExitReentry"("createdBy");

-- CreateIndex
CREATE INDEX "ExitReentry_updatedBy_idx" ON "ExitReentry"("updatedBy");

-- CreateIndex
CREATE INDEX "GosiCity_createdBy_idx" ON "GosiCity"("createdBy");

-- CreateIndex
CREATE INDEX "GosiCity_updatedBy_idx" ON "GosiCity"("updatedBy");

-- CreateIndex
CREATE INDEX "Loan_createdBy_idx" ON "Loan"("createdBy");

-- CreateIndex
CREATE INDEX "Loan_updatedBy_idx" ON "Loan"("updatedBy");

-- CreateIndex
CREATE INDEX "PaymentMethod_createdBy_idx" ON "PaymentMethod"("createdBy");

-- CreateIndex
CREATE INDEX "PaymentMethod_updatedBy_idx" ON "PaymentMethod"("updatedBy");

-- CreateIndex
CREATE INDEX "PayrollDetails_updatedBy_idx" ON "PayrollDetails"("updatedBy");

-- CreateIndex
CREATE INDEX "PayrollSection_createdBy_idx" ON "PayrollSection"("createdBy");

-- CreateIndex
CREATE INDEX "PayrollSection_updatedBy_idx" ON "PayrollSection"("updatedBy");

-- CreateIndex
CREATE INDEX "PayrollStatus_createdBy_idx" ON "PayrollStatus"("createdBy");

-- CreateIndex
CREATE INDEX "PayrollStatus_updatedBy_idx" ON "PayrollStatus"("updatedBy");

-- CreateIndex
CREATE INDEX "PayrollSummary_updatedBy_idx" ON "PayrollSummary"("updatedBy");

-- CreateIndex
CREATE INDEX "Project_createdBy_idx" ON "Project"("createdBy");

-- CreateIndex
CREATE INDEX "Project_updatedBy_idx" ON "Project"("updatedBy");

-- CreateIndex
CREATE INDEX "Timesheet_createdBy_idx" ON "Timesheet"("createdBy");

-- CreateIndex
CREATE INDEX "Timesheet_updatedBy_idx" ON "Timesheet"("updatedBy");

-- CreateIndex
CREATE INDEX "TrafficChallan_createdBy_idx" ON "TrafficChallan"("createdBy");

-- CreateIndex
CREATE INDEX "TrafficChallan_updatedBy_idx" ON "TrafficChallan"("updatedBy");

-- CreateIndex
CREATE INDEX "UserPrivilege_createdBy_idx" ON "UserPrivilege"("createdBy");

-- CreateIndex
CREATE INDEX "UserPrivilege_updatedBy_idx" ON "UserPrivilege"("updatedBy");

-- CreateIndex
CREATE INDEX "UserRole_createdBy_idx" ON "UserRole"("createdBy");

-- CreateIndex
CREATE INDEX "UserRole_updatedBy_idx" ON "UserRole"("updatedBy");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPrivilege" ADD CONSTRAINT "UserPrivilege_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPrivilege" ADD CONSTRAINT "UserPrivilege_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GosiCity" ADD CONSTRAINT "GosiCity_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GosiCity" ADD CONSTRAINT "GosiCity_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Designation" ADD CONSTRAINT "Designation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Designation" ADD CONSTRAINT "Designation_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeStatus" ADD CONSTRAINT "EmployeeStatus_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeStatus" ADD CONSTRAINT "EmployeeStatus_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollSection" ADD CONSTRAINT "PayrollSection_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollSection" ADD CONSTRAINT "PayrollSection_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollStatus" ADD CONSTRAINT "PayrollStatus_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollStatus" ADD CONSTRAINT "PayrollStatus_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollSummary" ADD CONSTRAINT "PayrollSummary_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollDetails" ADD CONSTRAINT "PayrollDetails_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrafficChallan" ADD CONSTRAINT "TrafficChallan_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrafficChallan" ADD CONSTRAINT "TrafficChallan_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitReentry" ADD CONSTRAINT "ExitReentry_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitReentry" ADD CONSTRAINT "ExitReentry_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceNotAvailable" ADD CONSTRAINT "AllowanceNotAvailable_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceNotAvailable" ADD CONSTRAINT "AllowanceNotAvailable_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
