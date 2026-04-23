"use client";
import { Button, TitleHeader } from "@/components";

interface LedgerHeaderProps {
  onPrint: () => void;
  isPrintDisabled: boolean;
  title?: string;
}

export const LedgerHeader = ({
  onPrint,
  isPrintDisabled,
  title = "EMPLOYEE LEDGER",
}: LedgerHeaderProps) => {
  return (
    <TitleHeader
      showBack={false}
      title={title}
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
