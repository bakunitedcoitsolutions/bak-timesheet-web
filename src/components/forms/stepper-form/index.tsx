"use client";

import { classNames } from "primereact/utils";
import React, { useState, ReactNode } from "react";

import Button from "../button";
import Stepper, { StepperStep } from "../stepper";
import { StepperFormProvider, useStepperForm } from "@/context";
import { useRouter } from "next/navigation";

interface StepperFormProps {
  steps: StepperStep[];
  initialStep?: number;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  onStepChange?: (step: number) => void;
  onStepSave?: (step: number) => Promise<boolean> | boolean;
  children: (step: number) => ReactNode;
  showNavigation?: boolean;
  className?: string;
}

const StepperFormContent: React.FC<StepperFormProps> = ({
  steps,
  initialStep = 0,
  onSubmit,
  onStepChange,
  onStepSave,
  children,
  showNavigation = true,
  className,
}) => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { isSubmitting } = useStepperForm();

  const markStepAsCompleted = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };

  // Sync activeStep when initialStep changes (e.g., after redirect)
  React.useEffect(() => {
    setActiveStep(initialStep);
    // Mark step 1 as completed when moving to step 2
    if (initialStep === 1) {
      setCompletedSteps((prev) => {
        if (!prev.includes(1)) {
          return [...prev, 1];
        }
        return prev;
      });
    }
  }, [initialStep]);

  const handleNext = async () => {
    if (activeStep < steps.length - 1) {
      // Call step-specific save handler if provided
      if (onStepSave) {
        const result = await onStepSave(activeStep);
        if (result === false) {
          // Save failed, don't proceed
          return;
        }
      }

      // Mark current step as completed
      const currentStepNumber = steps[activeStep].number;
      markStepAsCompleted(currentStepNumber);

      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      onStepChange?.(nextStep);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      if (
        activeStep === steps.length - 1 &&
        completedSteps.length === steps.length
      ) {
        unmarkStepAsCompleted(steps[activeStep].number);
        return;
      }

      const prevStep = activeStep - 1;
      setActiveStep(prevStep);
      onStepChange?.(prevStep);
      unmarkStepAsCompleted(activeStep);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps or next step
    if (
      completedSteps.includes(steps[stepIndex].number) ||
      stepIndex === activeStep + 1
    ) {
      setActiveStep(stepIndex);
      onStepChange?.(stepIndex);
    }
  };

  const unmarkStepAsCompleted = (stepNumber: number) => {
    setCompletedSteps(completedSteps.filter((num) => num !== stepNumber));
  };

  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  return (
    <div className={classNames(className, "flex flex-1")}>
      <div className="flex flex-1 flex-col lg:flex-row gap-5">
        {/* Stepper Sidebar */}
        <div className="w-full lg:w-72">
          <Stepper
            steps={steps}
            completedSteps={completedSteps}
            activeStep={steps[activeStep]?.number || 1}
          />
        </div>

        {/* Form Content */}
        <div className="w-full lg:w-full">
          <div className="bg-white h-full flex flex-col justify-between rounded-xl border border-gray-100">
            {/* Step Content */}
            <div className="mb-6 flex flex-1">{children(activeStep)}</div>

            {/* Navigation Buttons */}
            {showNavigation && (
              <div className="flex justify-between items-center p-6">
                {isFirstStep ? (
                  <div />
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={isFirstStep}
                    onClick={handlePrevious}
                    icon="pi pi-chevron-left"
                    className="gap-x-2"
                  >
                    Back
                  </Button>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => router.replace("/employees")}
                  >
                    Cancel
                  </Button>
                  {isLastStep ? (
                    <Button
                      size="small"
                      variant="solid"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      onClick={async () => {
                        try {
                          // Save current step before submitting
                          if (onStepSave) {
                            const result = await onStepSave(activeStep);
                            if (result === false) {
                              // Save failed, don't submit
                              return;
                            }
                          }

                          // Mark last step as completed before submitting
                          const currentStepNumber = steps[activeStep].number;
                          markStepAsCompleted(currentStepNumber);
                          await onSubmit?.({});
                        } catch (error) {
                          console.error("Error during submit:", error);
                        }
                      }}
                      iconPosition="right"
                      icon="pi pi-check"
                      className="w-28 justify-center! gap-1!"
                    >
                      Submit
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="solid"
                      onClick={handleNext}
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      className="justify-center! gap-1"
                    >
                      Save & Proceed
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StepperForm: React.FC<StepperFormProps> = (props) => {
  return (
    <StepperFormProvider>
      <StepperFormContent {...props} />
    </StepperFormProvider>
  );
};

export default StepperForm;
