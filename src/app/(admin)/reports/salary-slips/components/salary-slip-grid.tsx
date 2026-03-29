"use client";

import { memo } from "react";
import { SalarySlip } from "@/components";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";

interface SalarySlipGridProps {
  entries: PayrollDetailEntry[];
  monthYear: string;
}

export const SalarySlipGrid = memo(
  ({ entries, monthYear }: SalarySlipGridProps) => {
    // Chunk salary slips into groups of 3 for A4 printing (1 slip = 1/3 of A4 height approximately)
    const slipsPerPage = 3;
    const chunks: PayrollDetailEntry[][] = [];
    for (let i = 0; i < entries.length; i += slipsPerPage) {
      chunks.push(entries.slice(i, i + slipsPerPage));
    }

    return (
      <div className="flex flex-col gap-5">
        {chunks.map((chunk, chunkIndex) => (
          <div
            key={chunkIndex}
            className={`flex flex-col gap-6 print:gap-4 ${
              chunkIndex < chunks.length - 1 ? "print:break-after-page" : ""
            }`}
          >
            {chunk.map((entry) => (
              <div
                key={`${entry.id}-${entry.empCode}`}
                className="print:break-inside-avoid"
              >
                <SalarySlip entry={entry} monthYear={monthYear} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
);

SalarySlipGrid.displayName = "SalarySlipGrid";
