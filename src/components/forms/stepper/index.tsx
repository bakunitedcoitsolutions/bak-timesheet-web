"use client";

import React from "react";
import { classNames } from "primereact/utils";

export interface StepperStep {
  id: string;
  label: string;
  number: number;
}

interface StepperProps {
  activeStep: number;
  className?: string;
  steps: StepperStep[];
  completedSteps?: number[];
  onStepClick?: (stepIndex: number) => void;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  className,
  activeStep,
  onStepClick,
  completedSteps = [],
}) => {
  const isStepCompleted = (stepNumber: number) =>
    completedSteps.includes(stepNumber);
  const isStepActive = (stepNumber: number) => activeStep === stepNumber;
  const isStepPending = (stepNumber: number) =>
    !isStepCompleted(stepNumber) && !isStepActive(stepNumber);

  return (
    <div className={classNames("bg-white rounded-xl p-6 h-full ", className)}>
      <div className="flex flex-row flex-wrap lg:flex-col justify-center gap-x-10 gap-y-5 lg:gap-y-15">
        {steps.map((step, index) => {
          const stepNumber = step.number;
          const completed = isStepCompleted(stepNumber);
          const active = isStepActive(stepNumber);
          const pending = isStepPending(stepNumber);
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className={classNames(
                "flex flex-col lg:flex-row justify-center lg:justify-start items-center gap-2.5 relative",
                {
                  "cursor-pointer": onStepClick,
                }
              )}
              onClick={() => onStepClick?.(index)}
            >
              <div className="shrink-0 relative z-10 w-8 h-8">
                {completed ? (
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                    <i className="pi pi-check text-white text-sm"></i>
                  </div>
                ) : (
                  <div
                    className={classNames(
                      "w-full h-full rounded-full flex items-center justify-center",
                      {
                        "bg-white border border-[#A1AEBE]":
                          !completed && !active,
                        "bg-primary text-white border border-primary":
                          completed || active,
                      }
                    )}
                  >
                    <span
                      className={classNames("text-sm font-semibold mt-[2px]", {
                        "": !completed && !active,
                        "text-white": completed || active,
                      })}
                    >
                      {String(stepNumber).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>

              {/* Step Label */}
              <div className="flex-1">
                <span
                  className={classNames("text-sm", {
                    "text-primary font-bold": completed || active,
                    "font-semibold": pending,
                  })}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={classNames(
                    "absolute z-10 left-[14px] top-10 w-0.5 hidden lg:block bg-[#A1AEBE]"
                  )}
                  style={{ height: "calc(100% + 0.7rem)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
