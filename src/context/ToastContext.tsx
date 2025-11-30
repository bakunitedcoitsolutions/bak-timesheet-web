"use client";

import React, { createContext, useContext, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import type { ToastMessage } from "primereact/toast";

import { CustomToast } from "@/components";
import { toastService } from "@/lib/toast";

interface ToastContextType {
  showToast: (message: ToastMessage) => void;
  showSuccess: (summary: string, detail?: string) => void;
  showError: (summary: string, detail?: string) => void;
  showInfo: (summary: string, detail?: string) => void;
  showWarn: (summary: string, detail?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useRef<Toast>(null);

  // Subscribe to toast service for middleware/utility usage
  useEffect(() => {
    const unsubscribe = toastService.subscribe((message) => {
      toast.current?.show(message);
    });
    return unsubscribe;
  }, []);

  const showToast = (message: ToastMessage) => {
    toast.current?.show(message);
  };

  const showSuccess = (summary: string, detail?: string) => {
    toast.current?.show({
      severity: "success",
      summary,
      detail,
      life: 3000,
      content: () => (
        <CustomToast type="success" title={summary} message={detail} />
      ),
    });
  };

  const showError = (summary: string, detail?: string) => {
    toast.current?.show({
      severity: "error",
      summary,
      detail,
      life: 3000,
      content: () => (
        <CustomToast type="error" title={summary} message={detail} />
      ),
    });
  };

  const showInfo = (summary: string, detail?: string) => {
    toast.current?.show({
      severity: "info",
      summary,
      detail,
      life: 3000,
      content: () => (
        <CustomToast type="info" title={summary} message={detail} />
      ),
    });
  };

  const showWarn = (summary: string, detail?: string) => {
    toast.current?.show({
      severity: "warn",
      summary,
      detail,
      life: 3000,
      content: () => (
        <CustomToast type="warn" title={summary} message={detail} />
      ),
    });
  };

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showInfo, showWarn }}
    >
      <Toast ref={toast} />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
