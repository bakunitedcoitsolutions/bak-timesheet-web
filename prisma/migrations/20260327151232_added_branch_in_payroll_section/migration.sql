-- AlterTable
ALTER TABLE "PayrollSection" ADD COLUMN     "branchId" INTEGER DEFAULT 1;

-- AddForeignKey
ALTER TABLE "PayrollSection" ADD CONSTRAINT "PayrollSection_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
