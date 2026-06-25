"use client";
import { Button } from "@/components";
import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";

interface EmployeeHeaderProps {
  canAdd: boolean;
  canEdit: boolean;
  onNewEmployee: () => void;
}

export const EmployeeHeader = ({
  canAdd,
  canEdit,
  onNewEmployee,
}: EmployeeHeaderProps) => {
  const router = useRouter();
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
      <div className="flex gap-3 w-full md:w-auto items-center justify-between md:justify-end">
        {canAdd && (
          <div className="w-auto">
            <Button
              size="small"
              variant="solid"
              icon="pi pi-plus"
              label="New Employee"
              onClick={onNewEmployee}
            />
          </div>
        )}
        {canAdd && canEdit && (
          <div className="w-auto">
            <Button
              size="small"
              variant="outlined"
              severity="success"
              icon="pi pi-cloud-upload text-lg!"
              className={classNames("h-10! rounded-lg!")}
              onClick={() => router.push("/employees/bulk-upload")}
            >
              <span className="text-center font-semibold px-2">
                Bulk Upload
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
