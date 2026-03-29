"use client";

import { memo } from "react";
import { EmployeeCard } from "@/components";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";

interface EmployeeGridProps {
  employees: ListedEmployee[];
  getDesignationName: (id: number | null) => string | undefined;
}

export const EmployeeGrid = memo(
  ({ employees, getDesignationName }: EmployeeGridProps) => {
    // Chunk employees into groups of 9 for A4 printing (3x3 grid)
    const chunkSize = 9;
    const chunks = [];
    for (let i = 0; i < employees.length; i += chunkSize) {
      chunks.push(employees.slice(i, i + chunkSize));
    }

    return (
      <div className="flex flex-row flex-wrap gap-5 print:block">
        {chunks.map((chunk, chunkIndex) => (
          <div
            key={chunkIndex}
            className={`contents print:grid print:grid-cols-3 print:gap-x-4 print:gap-y-4 ${
              chunkIndex < chunks.length - 1 ? "print:break-after-page" : ""
            }`}
          >
            {chunk.map((employee) => (
              <div key={employee.id} className="print:break-inside-avoid">
                <EmployeeCard
                   employee={employee}
                   designationName={getDesignationName(employee.designationId)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
);
