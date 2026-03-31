"use client";
import { useImperativeHandle, forwardRef } from "react";
import { ProgressSpinner } from "primereact/progressspinner";

import { Form } from "@/components/forms";
import { StepperFormHeading } from "@/components/common";
import { useStep2Logic } from "./hooks/use-step2-logic";
import BasicContractFields from "./components/basic-contract-fields";
import FinancialFields from "./components/financial-fields";
import ContractDateFields from "./components/contract-date-fields";
import ContractAttachmentFields from "./components/contract-attachment-fields";

interface Step2Props {
  employeeId?: number | null;
}

export interface Step2Handle {
  submit: () => Promise<boolean>;
}

const Step2 = forwardRef<Step2Handle, Step2Props>(({ employeeId }, ref) => {
  const {
    form,
    options,
    isFixed,
    isBranchScoped,
    isLoadingEmployee,
    remainingDays,
    contractDocUpload,
    contractDocPickerValue,
    handleSalaryBlur,
    handleFormSubmit,
    onFormSubmit,
    handleSubmit,
  } = useStep2Logic({ employeeId });

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
      <div className="flex flex-1 md:flex-none flex-col gap-4 py-6">
        <StepperFormHeading title="Contract Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
          <BasicContractFields
            options={options}
            isBranchScoped={isBranchScoped}
          />

          {/* Mobile Separators are inside components if needed, 
              but we can also add them here between logical sections */}
          <div className="w-full h-px mt-2 mb-2 bg-primary-light block md:hidden xl:col-span-4" />

          <FinancialFields
            options={options}
            isFixed={isFixed}
            handleSalaryBlur={handleSalaryBlur}
          />

          <div className="w-full h-px mt-2 mb-2 bg-primary-light block md:hidden xl:col-span-4" />

          <ContractDateFields remainingDays={remainingDays} />

          <ContractAttachmentFields
            contractDocUpload={contractDocUpload}
            contractDocPickerValue={contractDocPickerValue}
          />
        </div>
      </div>
    </Form>
  );
});

Step2.displayName = "Step2";

export default Step2;
