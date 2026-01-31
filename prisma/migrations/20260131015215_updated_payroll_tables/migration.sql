/*
  Warnings:

  - You are about to drop the column `payrollId` on the `Ledger` table. All the data in the column will be lost.
  - You are about to drop the `Payroll` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ledger" DROP CONSTRAINT "Ledger_payrollId_fkey";

-- DropForeignKey
ALTER TABLE "Payroll" DROP CONSTRAINT "Payroll_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Payroll" DROP CONSTRAINT "Payroll_sectionId_fkey";

-- AlterTable
ALTER TABLE "Ledger" DROP COLUMN "payrollId",
ADD COLUMN     "payrollDetailId" INTEGER;

-- DropTable
DROP TABLE "Payroll";

-- CreateTable
CREATE TABLE "PayrollStatus" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollSummary" (
    "id" SERIAL NOT NULL,
    "payrollMonth" INTEGER NOT NULL,
    "payrollYear" INTEGER NOT NULL,
    "totalSalary" DECIMAL(10,2) NOT NULL,
    "totalPreviousAdvance" DECIMAL(10,2) NOT NULL,
    "totalCurrentAdvance" DECIMAL(10,2) NOT NULL,
    "totalDeduction" DECIMAL(10,2) NOT NULL,
    "totalNetLoan" DECIMAL(10,2) NOT NULL,
    "totalNetSalaryPayable" DECIMAL(10,2) NOT NULL,
    "totalCardSalary" DECIMAL(10,2) NOT NULL,
    "totalCashSalary" DECIMAL(10,2) NOT NULL,
    "remarks" TEXT,
    "payrollStatusId" INTEGER,
    "branchId" INTEGER,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "modifiedDate" TIMESTAMP(3) NOT NULL,
    "modifiedBy" INTEGER,

    CONSTRAINT "PayrollSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollDetails" (
    "id" SERIAL NOT NULL,
    "payrollId" INTEGER NOT NULL,
    "payrollMonth" INTEGER NOT NULL,
    "payrollYear" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "workDays" INTEGER NOT NULL,
    "totalHours" DECIMAL(10,2) NOT NULL,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "allowance" DECIMAL(10,2) NOT NULL,
    "salary" DECIMAL(10,2) NOT NULL,
    "previousLoan" DECIMAL(10,2) NOT NULL,
    "currentLoan" DECIMAL(10,2) NOT NULL,
    "deductionLoan" DECIMAL(10,2) NOT NULL,
    "netLoan" DECIMAL(10,2) NOT NULL,
    "previousTrafficChallan" DECIMAL(10,2) NOT NULL,
    "currentTrafficChallan" DECIMAL(10,2) NOT NULL,
    "deductionTrafficChallan" DECIMAL(10,2) NOT NULL,
    "netTrafficChallan" DECIMAL(10,2) NOT NULL,
    "netSalaryPayable" DECIMAL(10,2) NOT NULL,
    "cardSalary" DECIMAL(10,2) NOT NULL,
    "cashSalary" DECIMAL(10,2) NOT NULL,
    "overTime" DECIMAL(10,2) NOT NULL,
    "remarks" TEXT,
    "paymentMethodId" INTEGER,
    "payrollStatusId" INTEGER,
    "branchId" INTEGER,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "modifiedDate" TIMESTAMP(3) NOT NULL,
    "modifiedBy" INTEGER,
    "payrollSectionId" INTEGER,

    CONSTRAINT "PayrollDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PayrollSummary_payrollMonth_payrollYear_idx" ON "PayrollSummary"("payrollMonth", "payrollYear");

-- CreateIndex
CREATE INDEX "PayrollSummary_branchId_idx" ON "PayrollSummary"("branchId");

-- CreateIndex
CREATE INDEX "PayrollSummary_payrollStatusId_idx" ON "PayrollSummary"("payrollStatusId");

-- CreateIndex
CREATE INDEX "PayrollSummary_createdBy_idx" ON "PayrollSummary"("createdBy");

-- CreateIndex
CREATE INDEX "PayrollSummary_modifiedBy_idx" ON "PayrollSummary"("modifiedBy");

-- CreateIndex
CREATE INDEX "PayrollDetails_payrollId_idx" ON "PayrollDetails"("payrollId");

-- CreateIndex
CREATE INDEX "PayrollDetails_employeeId_idx" ON "PayrollDetails"("employeeId");

-- CreateIndex
CREATE INDEX "PayrollDetails_payrollMonth_payrollYear_idx" ON "PayrollDetails"("payrollMonth", "payrollYear");

-- CreateIndex
CREATE INDEX "PayrollDetails_branchId_idx" ON "PayrollDetails"("branchId");

-- CreateIndex
CREATE INDEX "PayrollDetails_payrollStatusId_idx" ON "PayrollDetails"("payrollStatusId");

-- CreateIndex
CREATE INDEX "PayrollDetails_paymentMethodId_idx" ON "PayrollDetails"("paymentMethodId");

-- CreateIndex
CREATE INDEX "PayrollDetails_createdBy_idx" ON "PayrollDetails"("createdBy");

-- CreateIndex
CREATE INDEX "PayrollDetails_modifiedBy_idx" ON "PayrollDetails"("modifiedBy");

-- AddForeignKey
ALTER TABLE "PayrollSummary" ADD CONSTRAINT "PayrollSummary_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollSummary" ADD CONSTRAINT "PayrollSummary_payrollStatusId_fkey" FOREIGN KEY ("payrollStatusId") REFERENCES "PayrollStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollSummary" ADD CONSTRAINT "PayrollSummary_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollSummary" ADD CONSTRAINT "PayrollSummary_modifiedBy_fkey" FOREIGN KEY ("modifiedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollDetails" ADD CONSTRAINT "PayrollDetails_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "PayrollSummary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollDetails" ADD CONSTRAINT "PayrollDetails_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollDetails" ADD CONSTRAINT "PayrollDetails_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollDetails" ADD CONSTRAINT "PayrollDetails_payrollStatusId_fkey" FOREIGN KEY ("payrollStatusId") REFERENCES "PayrollStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollDetails" ADD CONSTRAINT "PayrollDetails_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollDetails" ADD CONSTRAINT "PayrollDetails_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollDetails" ADD CONSTRAINT "PayrollDetails_modifiedBy_fkey" FOREIGN KEY ("modifiedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollDetails" ADD CONSTRAINT "PayrollDetails_payrollSectionId_fkey" FOREIGN KEY ("payrollSectionId") REFERENCES "PayrollSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_payrollDetailId_fkey" FOREIGN KEY ("payrollDetailId") REFERENCES "PayrollDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
