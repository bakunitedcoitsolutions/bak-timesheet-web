-- AlterTable
ALTER TABLE "PayrollDetails" ADD COLUMN     "overtimeAllowance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tripAllowance" INTEGER NOT NULL DEFAULT 0;
