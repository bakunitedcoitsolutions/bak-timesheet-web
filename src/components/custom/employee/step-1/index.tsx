"use client";
import { useImperativeHandle, forwardRef } from "react";
import { ProgressSpinner } from "primereact/progressspinner";

import { Form } from "@/components/forms";
import { useStep1Logic } from "./hooks/use-step1-logic";
import { StepperFormHeading } from "@/components/common";
import BasicInfoFields from "./components/basic-info-fields";
import EmployeeCodeSection from "./components/employee-code-section";
import ProfilePictureUpload from "./components/profile-picture-upload";

interface Step1Props {
  isAddMode?: boolean;
  isEditMode?: boolean;
  employeeId?: number | null;
  onStepComplete?: (employeeId: number) => void;
}

export interface Step1Handle {
  submit: () => Promise<boolean>;
}

const Step1 = forwardRef<Step1Handle, Step1Props>(
  (
    { employeeId, isAddMode = true, isEditMode = false, onStepComplete },
    ref
  ) => {
    const {
      form,
      fileUpload,
      isLoadingEmployee,
      onFormSubmit,
      handleFormSubmit,
      handleSubmit,
    } = useStep1Logic({
      employeeId,
      isAddMode,
      isEditMode,
      onStepComplete,
    });

    // Expose submit method via ref for StepperForm to call
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

    if (isLoadingEmployee && isEditMode) {
      return (
        <div className="flex items-center justify-center h-full">
          <ProgressSpinner />
        </div>
      );
    }

    return (
      <Form form={form} onSubmit={onFormSubmit}>
        <div className="flex flex-1 md:flex-none flex-col gap-4 py-6">
          <StepperFormHeading title="Basic Info" />
          <div className="flex flex-col xl:flex-row gap-2">
            <ProfilePictureUpload fileUpload={fileUpload} />
            <EmployeeCodeSection />
          </div>
          <BasicInfoFields />
        </div>
      </Form>
    );
  }
);

Step1.displayName = "Step1";

export default Step1;
