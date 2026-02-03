"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Step1,
  Step2,
  Step3,
  Step4,
  Step5,
  type Step1Handle,
  type Step2Handle,
  type Step3Handle,
  type Step4Handle,
  type Step5Handle,
} from "@/components";
import { getEntityModeFromParam } from "@/helpers";
import { StepperForm, StepperStep } from "@/components/forms";

const steps: StepperStep[] = [
  { id: "basic-info", label: "Basic Info", number: 1 },
  { id: "contract-details", label: "Contract Details", number: 2 },
  { id: "identity", label: "Identity", number: 3 },
  { id: "financial-details", label: "Financial Details", number: 4 },
  { id: "other-details", label: "Other Details", number: 5 },
];

const UpsertEmployeePage = () => {
  const router = useRouter();
  const { id: employeeIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: employeeId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: employeeIdParam,
  });

  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(
    isEditMode && employeeId ? Number(employeeId) : null
  );
  const step1Ref = useRef<Step1Handle | null>(null);
  const step2Ref = useRef<Step2Handle | null>(null);
  const step3Ref = useRef<Step3Handle | null>(null);
  const step4Ref = useRef<Step4Handle | null>(null);
  const step5Ref = useRef<Step5Handle | null>(null);

  const [initialStep] = useState(() => {
    if (typeof window !== "undefined" && isEditMode && employeeId) {
      const justCreatedId = sessionStorage.getItem("justCreatedEmployeeId");
      if (justCreatedId === String(employeeId)) {
        // Clear the flag and start at step 2
        sessionStorage.removeItem("justCreatedEmployeeId");
        return 1;
      }
    }
    return 2;
  });

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  const handleStepComplete = (newEmployeeId: number) => {
    setCurrentEmployeeId(newEmployeeId);

    // If we're in add mode and just created an employee, redirect to edit URL
    if (isAddMode && newEmployeeId) {
      // Store in sessionStorage so we know to start at step 2 after redirect
      if (typeof window !== "undefined") {
        sessionStorage.setItem("justCreatedEmployeeId", String(newEmployeeId));
      }
      router.replace(`/employees/${newEmployeeId}`);
    }
  };

  const handleStepSave = async (step: number): Promise<boolean> => {
    if (step === 0 && step1Ref.current) {
      return await step1Ref.current.submit();
    }
    if (step === 1 && step2Ref.current) {
      return await step2Ref.current.submit();
    }
    if (step === 2 && step3Ref.current) {
      return await step3Ref.current.submit();
    }
    if (step === 3 && step4Ref.current) {
      return await step4Ref.current.submit();
    }
    if (step === 4 && step5Ref.current) {
      return await step5Ref.current.submit();
    }
    return true;
  };

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Form submitted:", data);
    router.replace(`/employees`);
  };

  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <Step1
            ref={step1Ref}
            employeeId={currentEmployeeId}
            isAddMode={isAddMode}
            isEditMode={isEditMode}
            onStepComplete={handleStepComplete}
          />
        );
      case 1:
        return <Step2 ref={step2Ref} employeeId={currentEmployeeId} />;
      case 2:
        return <Step3 ref={step3Ref} employeeId={currentEmployeeId} />;
      case 3:
        return <Step4 ref={step4Ref} employeeId={currentEmployeeId} />;
      case 4:
        return <Step5 ref={step5Ref} employeeId={currentEmployeeId} />;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        {isAddMode ? "Add Employee" : "Edit Employee"}
      </h1>
      <StepperForm
        steps={steps}
        onSubmit={handleSubmit}
        initialStep={initialStep}
        onStepSave={handleStepSave}
        isEditMode={isEditMode}
        className="w-full h-full"
      >
        {renderStepContent}
      </StepperForm>
    </div>
  );
};

export default UpsertEmployeePage;
