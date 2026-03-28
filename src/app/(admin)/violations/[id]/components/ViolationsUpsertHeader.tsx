"use client";

import { StepperFormHeading } from "@/components";

interface ViolationsUpsertHeaderProps {
  isAddMode: boolean;
}

export const ViolationsUpsertHeader = ({
  isAddMode,
}: ViolationsUpsertHeaderProps) => {
  return (
    <StepperFormHeading
      title={isAddMode ? "Add Violation" : "Edit Violation"}
    />
  );
};
