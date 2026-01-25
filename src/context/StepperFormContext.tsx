"use client";

import React, { createContext, useContext, useState } from "react";

interface StepperFormContextType {
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

const StepperFormContext = createContext<StepperFormContextType | undefined>(
  undefined
);

export function StepperFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <StepperFormContext.Provider value={{ isSubmitting, setIsSubmitting }}>
      {children}
    </StepperFormContext.Provider>
  );
}

export function useStepperForm() {
  const context = useContext(StepperFormContext);
  if (context === undefined) {
    throw new Error(
      "useStepperForm must be used within a StepperFormProvider"
    );
  }
  return context;
}
