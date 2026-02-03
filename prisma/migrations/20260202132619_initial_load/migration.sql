-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('LOAN', 'RETURN');

-- CreateEnum
CREATE TYPE "TrafficChallanType" AS ENUM ('CHALLAN', 'RETURN');

-- CreateEnum
CREATE TYPE "ExitReentryType" AS ENUM ('EXIT', 'ENTRY');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('SALARY', 'LOAN', 'CHALLAN');

-- CreateEnum
CREATE TYPE "AmountType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "AllowanceType" AS ENUM ('BREAKFAST', 'FOOD', 'MOBILE', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "userRoleId" INTEGER NOT NULL,
    "branchId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "access" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPrivilege" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "privileges" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPrivilege_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "countryId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GosiCity" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GosiCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "profilePicture" TEXT,
    "employeeCode" INTEGER NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "dob" TIMESTAMP(3),
    "phone" TEXT,
    "gender" TEXT,
    "countryId" INTEGER,
    "cityId" INTEGER,
    "statusId" INTEGER,
    "branchId" INTEGER,
    "designationId" INTEGER,
    "payrollSectionId" INTEGER,
    "isDeductable" BOOLEAN NOT NULL DEFAULT false,
    "isFixed" BOOLEAN NOT NULL DEFAULT false,
    "workingDays" INTEGER,
    "hourlyRate" DECIMAL(10,1),
    "salary" DECIMAL(10,1),
    "breakfastAllowance" BOOLEAN NOT NULL DEFAULT false,
    "foodAllowance" DECIMAL(10,1),
    "mobileAllowance" DECIMAL(10,1),
    "otherAllowance" DECIMAL(10,1),
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "contractDocument" TEXT,
    "contractEndReason" TEXT,
    "joiningDate" TIMESTAMP(3),
    "idCardNo" TEXT,
    "idCardExpiryDate" TIMESTAMP(3),
    "idCardDocument" TEXT,
    "profession" TEXT,
    "nationalityId" INTEGER,
    "passportNo" TEXT,
    "passportExpiryDate" TIMESTAMP(3),
    "passportDocument" TEXT,
    "lastExitDate" TIMESTAMP(3),
    "lastEntryDate" TIMESTAMP(3),
    "bankName" TEXT,
    "bankCode" TEXT,
    "iban" TEXT,
    "gosiSalary" DECIMAL(10,1),
    "gosiCityId" INTEGER,
    "openingBalance" DECIMAL(10,1),
    "isCardDelivered" BOOLEAN NOT NULL DEFAULT false,
    "cardDocument" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designation" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "hoursPerDay" INTEGER,
    "displayOrderKey" INTEGER,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeStatus" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "branchId" INTEGER,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timesheet" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "project1Id" INTEGER,
    "project1Hours" INTEGER,
    "project1Overtime" INTEGER,
    "project2Id" INTEGER,
    "project2Hours" INTEGER,
    "project2Overtime" INTEGER,
    "totalHours" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollSection" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "displayOrderKey" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollSection_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "LoanType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrafficChallan" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "TrafficChallanType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrafficChallan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExitReentry" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "designationId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "ExitReentryType" NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExitReentry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ledger" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "LedgerType" NOT NULL,
    "amountType" "AmountType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "payrollDetailId" INTEGER,
    "loanId" INTEGER,
    "trafficChallanId" INTEGER,

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllowanceNotAvailable" (
    "id" SERIAL NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" "AllowanceType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllowanceNotAvailable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_userRoleId_idx" ON "User"("userRoleId");

-- CreateIndex
CREATE INDEX "User_branchId_idx" ON "User"("branchId");

-- CreateIndex
CREATE INDEX "User_createdBy_idx" ON "User"("createdBy");

-- CreateIndex
CREATE INDEX "User_updatedBy_idx" ON "User"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "UserPrivilege_userId_key" ON "UserPrivilege"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE INDEX "Employee_employeeCode_idx" ON "Employee"("employeeCode");

-- CreateIndex
CREATE INDEX "Employee_countryId_idx" ON "Employee"("countryId");

-- CreateIndex
CREATE INDEX "Employee_branchId_idx" ON "Employee"("branchId");

-- CreateIndex
CREATE INDEX "Employee_statusId_idx" ON "Employee"("statusId");

-- CreateIndex
CREATE INDEX "Timesheet_employeeId_idx" ON "Timesheet"("employeeId");

-- CreateIndex
CREATE INDEX "Timesheet_date_idx" ON "Timesheet"("date");

-- CreateIndex
CREATE INDEX "Timesheet_project1Id_idx" ON "Timesheet"("project1Id");

-- CreateIndex
CREATE INDEX "Timesheet_project2Id_idx" ON "Timesheet"("project2Id");

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

-- CreateIndex
CREATE INDEX "Loan_employeeId_idx" ON "Loan"("employeeId");

-- CreateIndex
CREATE INDEX "Loan_date_idx" ON "Loan"("date");

-- CreateIndex
CREATE INDEX "Loan_type_idx" ON "Loan"("type");

-- CreateIndex
CREATE INDEX "TrafficChallan_employeeId_idx" ON "TrafficChallan"("employeeId");

-- CreateIndex
CREATE INDEX "TrafficChallan_date_idx" ON "TrafficChallan"("date");

-- CreateIndex
CREATE INDEX "TrafficChallan_type_idx" ON "TrafficChallan"("type");

-- CreateIndex
CREATE INDEX "ExitReentry_employeeId_idx" ON "ExitReentry"("employeeId");

-- CreateIndex
CREATE INDEX "ExitReentry_designationId_idx" ON "ExitReentry"("designationId");

-- CreateIndex
CREATE INDEX "ExitReentry_date_idx" ON "ExitReentry"("date");

-- CreateIndex
CREATE INDEX "ExitReentry_type_idx" ON "ExitReentry"("type");

-- CreateIndex
CREATE INDEX "Ledger_date_idx" ON "Ledger"("date");

-- CreateIndex
CREATE INDEX "Ledger_employeeId_idx" ON "Ledger"("employeeId");

-- CreateIndex
CREATE INDEX "Ledger_type_idx" ON "Ledger"("type");

-- CreateIndex
CREATE INDEX "Ledger_amountType_idx" ON "Ledger"("amountType");

-- CreateIndex
CREATE INDEX "AllowanceNotAvailable_startDate_idx" ON "AllowanceNotAvailable"("startDate");

-- CreateIndex
CREATE INDEX "AllowanceNotAvailable_endDate_idx" ON "AllowanceNotAvailable"("endDate");

-- CreateIndex
CREATE INDEX "AllowanceNotAvailable_type_idx" ON "AllowanceNotAvailable"("type");

-- CreateIndex
CREATE INDEX "AllowanceNotAvailable_isActive_idx" ON "AllowanceNotAvailable"("isActive");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPrivilege" ADD CONSTRAINT "UserPrivilege_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_nationalityId_fkey" FOREIGN KEY ("nationalityId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "EmployeeStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_payrollSectionId_fkey" FOREIGN KEY ("payrollSectionId") REFERENCES "PayrollSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_gosiCityId_fkey" FOREIGN KEY ("gosiCityId") REFERENCES "GosiCity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_project1Id_fkey" FOREIGN KEY ("project1Id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_project2Id_fkey" FOREIGN KEY ("project2Id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrafficChallan" ADD CONSTRAINT "TrafficChallan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitReentry" ADD CONSTRAINT "ExitReentry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitReentry" ADD CONSTRAINT "ExitReentry_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_payrollDetailId_fkey" FOREIGN KEY ("payrollDetailId") REFERENCES "PayrollDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_trafficChallanId_fkey" FOREIGN KEY ("trafficChallanId") REFERENCES "TrafficChallan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
