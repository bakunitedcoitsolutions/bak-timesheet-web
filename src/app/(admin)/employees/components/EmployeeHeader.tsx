"use client";
import { Button } from "@/components";

interface EmployeeHeaderProps {
  canAdd: boolean;
  onNewEmployee: () => void;
}

export const EmployeeHeader = ({
  canAdd,
  onNewEmployee,
}: EmployeeHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
      <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Employee Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          View, manage employee records, personal information, and employment
          details.
        </p>
      </div>
      {canAdd && (
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="New Employee"
            onClick={onNewEmployee}
          />
        </div>
      )}
    </div>
  );
};
