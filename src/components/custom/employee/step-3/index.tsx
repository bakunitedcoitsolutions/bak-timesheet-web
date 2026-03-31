"use client";
import { useImperativeHandle, forwardRef } from "react";
import { ProgressSpinner } from "primereact/progressspinner";

import { StepperFormHeading } from "@/components/common";
import { Form } from "@/components/forms";
import { useStep3Logic } from "./hooks/use-step3-logic";
import IdentitySection from "./components/identity-section";
import PassportSection from "./components/passport-section";

interface Step3Props {
  employeeId?: number | null;
}

export interface Step3Handle {
  submit: () => Promise<boolean>;
}

const Step3 = forwardRef<Step3Handle, Step3Props>(({ employeeId }, ref) => {
  const {
    form,
    isLoadingEmployee,
    idCardDocUpload,
    idCardDocPickerValue,
    passportDocUpload,
    passportDocPickerValue,
    nationalityOptions,
    handleFormSubmit,
    onFormSubmit,
    handleSubmit,
  } = useStep3Logic({ employeeId });

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
          <StepperFormHeading title="Identity" />
          <IdentitySection
            fileUpload={idCardDocUpload}
            pickerValue={idCardDocPickerValue}
          />
        </div>
        <div className="flex flex-col gap-4">
          <StepperFormHeading title="Passport" />
          <PassportSection
            nationalityOptions={nationalityOptions}
            fileUpload={passportDocUpload}
            pickerValue={passportDocPickerValue}
          />
        </div>
      </div>
    </Form>
  );
});

Step3.displayName = "Step3";

export default Step3;
