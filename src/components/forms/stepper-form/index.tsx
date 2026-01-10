"use client";

import { classNames } from "primereact/utils";
import React, { useState, ReactNode } from "react";

import Button from "../button";
import Stepper, { StepperStep } from "../stepper";

interface StepperFormProps {
  steps: StepperStep[];
  initialStep?: number;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  onStepChange?: (step: number) => void;
  children: (step: number) => ReactNode;
  showNavigation?: boolean;
  className?: string;
}

const StepperForm: React.FC<StepperFormProps> = ({
  steps,
  initialStep = 0,
  onSubmit,
  onStepChange,
  children,
  showNavigation = true,
  className,
}) => {
  const [activeStep, setActiveStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
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

  const markStepAsCompleted = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
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
                  <Button size="small" variant="text" onClick={handlePrevious}>
                    Cancel
                  </Button>
                  {isLastStep ? (
                    <Button
                      size="small"
                      variant="solid"
                      onClick={() => {
                        // Mark last step as completed before submitting
                        const currentStepNumber = steps[activeStep].number;
                        markStepAsCompleted(currentStepNumber);
                        onSubmit?.({});
                      }}
                      iconPosition="right"
                      icon="pi pi-check"
                    >
                      Submit
                    </Button>
                  ) : (
                    <Button size="small" variant="solid" onClick={handleNext}>
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

export default StepperForm;
