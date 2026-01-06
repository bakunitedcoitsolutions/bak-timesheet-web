"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { getEntityModeFromParam } from "@/helpers";
import { StepperForm, StepperStep } from "@/components/forms";
import { Step1, Step2, Step3, Step4, Step5 } from "@/components";

const steps: StepperStep[] = [
  { id: "basic-info", label: "Basic Info", number: 1 },
  { id: "contract-details", label: "Contract Details", number: 2 },
  { id: "identity", label: "Identity", number: 3 },
  { id: "financial-details", label: "Financial Details", number: 4 },
  { id: "other-details", label: "Other Details", number: 5 },
];

const EmployeePage = () => {
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

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Form submitted:", data);
    // Handle form submission here
    router.replace(`/employees`);
  };

  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return <Step1 />;
      case 1:
        return <Step2 />;
      case 2:
        return <Step3 />;
      case 3:
        return <Step4 />;
      case 4:
        return <Step5 />;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        {isAddMode ? "Add Employee" : "Edit Employee"}
      </h1>
      <StepperForm
        steps={steps}
        initialStep={0}
        onSubmit={handleSubmit}
        className="w-full h-full"
      >
        {renderStepContent}
      </StepperForm>
    </div>
  );
};

export default EmployeePage;
