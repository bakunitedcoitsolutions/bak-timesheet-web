import { Button } from "@/components";

interface PayrollHeaderProps {
  onRunPayroll: () => void;
}

export const PayrollHeader = ({ onRunPayroll }: PayrollHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
      <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Payroll Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          View, manage payroll records, and payroll details.
        </p>
      </div>
      <div className="w-full md:w-auto">
        <Button
          size="small"
          variant="solid"
          label="Run Payroll"
          onClick={onRunPayroll}
        />
      </div>
    </div>
  );
};
