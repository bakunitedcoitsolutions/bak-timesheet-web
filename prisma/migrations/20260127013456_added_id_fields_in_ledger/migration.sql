-- AlterTable
ALTER TABLE "Ledger" ADD COLUMN     "loanId" INTEGER,
ADD COLUMN     "payrollId" INTEGER,
ADD COLUMN     "trafficChallanId" INTEGER;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_trafficChallanId_fkey" FOREIGN KEY ("trafficChallanId") REFERENCES "TrafficChallan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
