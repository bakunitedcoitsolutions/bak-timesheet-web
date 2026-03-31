"use client";
import { useImperativeHandle, forwardRef } from "react";
import { ProgressSpinner } from "primereact/progressspinner";

import { StepperFormHeading } from "@/components/common";
import { Form } from "@/components/forms";
import { useStep5Logic } from "./hooks/use-step5-logic";
import BankCardDetailsSection from "./components/bank-card-details-section";

interface Step5Props {
  employeeId?: number | null;
}

export interface Step5Handle {
  submit: () => Promise<boolean>;
}

const Step5 = forwardRef<Step5Handle, Step5Props>(({ employeeId }, ref) => {
  const {
    form,
    isLoadingEmployee,
    cardDocUpload,
    cardDocPickerValue,
    isCardDeliveredOptions,
    handleFormSubmit,
    onFormSubmit,
    handleSubmit,
  } = useStep5Logic({ employeeId });

  // Expose submit method via ref
  useImperativeHandle(ref, () => ({
    submit: async () => {
      return new Promise<boolean>((resolve) => {
        handleSubmit(async (data) => {
          const result = await handleFormSubmit(data);
          resolve(result);
        })();
      });
    },
  }));

  if (isLoadingEmployee) {
    return (
      <div className="flex items-center justify-center h-full">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <Form form={form} onSubmit={onFormSubmit}>
      <div className="flex flex-1 md:flex-none flex-col gap-10 py-6">
        <div className="flex flex-col gap-4">
          <StepperFormHeading title="Bank Card Details" />
          <BankCardDetailsSection
            isCardDeliveredOptions={isCardDeliveredOptions}
            fileUpload={cardDocUpload}
            pickerValue={cardDocPickerValue}
          />
        </div>
      </div>
    </Form>
  );
});

Step5.displayName = "Step5";

export default Step5;
