-- AlterTable
ALTER TABLE "PayrollDetails" ADD COLUMN     "allowanceNotAvailableId" INTEGER;

-- AddForeignKey
ALTER TABLE "PayrollDetails" ADD CONSTRAINT "PayrollDetails_allowanceNotAvailableId_fkey" FOREIGN KEY ("allowanceNotAvailableId") REFERENCES "AllowanceNotAvailable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
