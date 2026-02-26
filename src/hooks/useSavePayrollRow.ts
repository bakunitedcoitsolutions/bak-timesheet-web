import { useState } from "react";
import { useSavePayrollDetailsBatch } from "@/lib/db/services/payroll-summary";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";
import { toastService } from "@/lib/toast";

const buildRowEntry = (row: PayrollDetailEntry) => ({
  id: row.id,
  loanDeduction: row.loanDeduction,
  challanDeduction: row.challanDeduction,
  netSalaryPayable: row.totalSalary - row.loanDeduction - row.challanDeduction,
  netLoan:
    (row.previousAdvance ?? 0) +
    (row.currentAdvance ?? 0) -
    (row.loanDeduction ?? 0),
  netChallan:
    (row.previousChallan ?? 0) +
    (row.currentChallan ?? 0) -
    (row.challanDeduction ?? 0),
  cardSalary: row.cardSalary,
  cashSalary: row.cashSalary,
  remarks: row.remarks,
  paymentMethodId: row.paymentMethodId,
  payrollStatusId: row.payrollStatusId,
});

export const useSavePayrollRow = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { mutateAsync: savePayrollDetails } = useSavePayrollDetailsBatch();

  const saveRow = async (row: PayrollDetailEntry) => {
    try {
      setIsSaving(true);
      await savePayrollDetails({ entries: [buildRowEntry(row)] });
      toastService.showSuccess(
        "Saved",
        `Row saved successfully for ${row.empCode} - ${row.name}`
      );
    } catch (error: any) {
      toastService.showError(
        "Error",
        error.message || "Failed to save payroll details"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return { saveRow, isSaving };
};
