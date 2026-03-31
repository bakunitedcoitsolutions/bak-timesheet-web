"use client";
import { useImperativeHandle, forwardRef } from "react";
import { ProgressSpinner } from "primereact/progressspinner";

import { StepperFormHeading } from "@/components/common";
import { Form } from "@/components/forms";
import { useStep4Logic } from "./hooks/use-step4-logic";
import BankDetailsSection from "./components/bank-details-section";
import GosiDetailsSection from "./components/gosi-details-section";

interface Step4Props {
  employeeId?: number | null;
}

export interface Step4Handle {
  submit: () => Promise<boolean>;
}

const Step4 = forwardRef<Step4Handle, Step4Props>(({ employeeId }, ref) => {
  const {
    form,
    isLoadingEmployee,
    bankOptions,
    gosiCityOptions,
    handleFormSubmit,
    onFormSubmit,
    handleSubmit,
  } = useStep4Logic({ employeeId });

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
          <StepperFormHeading title="Bank Details" />
          <BankDetailsSection bankOptions={bankOptions} />
        </div>
        <div className="flex flex-col gap-4">
          <StepperFormHeading title="GOSI Details" />
          <GosiDetailsSection gosiCityOptions={gosiCityOptions} />
        </div>
      </div>
    </Form>
  );
});

Step4.displayName = "Step4";

export default Step4;
