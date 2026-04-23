"use client";
import { classNames } from "primereact/utils";

interface LedgerEmployeeInfoProps {
  employee: any;
  isLoading: boolean;
  employeeName: string;
  idCardNumber: string;
  isPrinting?: boolean;
  employeeDesignation: string;
  searchEmployeeCode: number | null;
}

export const LedgerEmployeeInfo = ({
  isLoading,
  employee,
  employeeName,
  employeeDesignation,
  idCardNumber,
  searchEmployeeCode,
  isPrinting = false,
}: LedgerEmployeeInfoProps) => {
  if (isLoading) {
    return (
      <div className="text-sm text-gray-500">Searching for employee...</div>
    );
  }

  if (!employee) {
    return (
      <div className="text-sm text-gray-500">
        {searchEmployeeCode
          ? "Employee not found"
          : "Enter employee code and click Search"}
      </div>
    );
  }

  return (
    <div
      className={classNames("flex flex-1 gap-3 justify-between", {
        "flex-row items-center": isPrinting,
        "flex-col sm:flex-row items-start sm:items-center": !isPrinting,
      })}
    >
      <div
        className={classNames("flex flex-1 gap-x-2 gap-y-1", {
          "flex-row items-center": isPrinting,
          "flex-col lg:flex-row items-start lg:items-center": !isPrinting,
        })}
      >
        <div className="flex gap-x-2">
          <span className="font-bold">{employee.employeeCode}</span>
          <span className="text-gray-400 font-semibold">-</span>
          <span className="font-semibold">{employeeName}</span>
        </div>
        {idCardNumber && (
          <div className="flex gap-x-2 items-center">
            <span
              className={classNames("text-gray-400", {
                "hidden lg:block": !isPrinting,
                inline: isPrinting,
              })}
            >
              |
            </span>
            <div className="flex gap-x-2">
              <span className="text-sm text-gray-600">ID Card:</span>
              <span className="text-sm font-semibold text-primary">
                {idCardNumber}
              </span>
            </div>
          </div>
        )}
      </div>
      {employeeDesignation && (
        <div
          className={classNames("flex justify-end", {
            "w-auto": isPrinting,
            "w-full sm:w-auto": !isPrinting,
          })}
        >
          <span className="font-bold text-right text-primary">
            {employeeDesignation}
          </span>
        </div>
      )}
    </div>
  );
};
