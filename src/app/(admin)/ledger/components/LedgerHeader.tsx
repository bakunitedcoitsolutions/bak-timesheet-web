"use client";
import React from "react";
import { Button, TitleHeader } from "@/components";

interface LedgerHeaderProps {
  onPrint: () => void;
  isPrintDisabled: boolean;
}

export const LedgerHeader = ({ onPrint, isPrintDisabled }: LedgerHeaderProps) => {
  return (
    <TitleHeader
      showBack={false}
      title="EMPLOYEE LEDGER"
      icon={<i className="fa-light fa-book-open-lines text-xl!" />}
      renderInput={() => (
        <div className="w-full lg:w-auto">
          <Button
            size="small"
            label="Print"
            icon="pi pi-print"
            variant="outlined"
            className="w-full lg:w-28 h-10! bg-white!"
            onClick={onPrint}
            disabled={isPrintDisabled}
          />
        </div>
      )}
    />
  );
};
