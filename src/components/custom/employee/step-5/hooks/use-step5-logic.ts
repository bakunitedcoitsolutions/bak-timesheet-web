"use client";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { STORAGE_CONFIG } from "@/utils/constants";
import { toastService } from "@/lib/toast";
import { getErrorMessage, FILE_TYPES } from "@/utils/helpers";
import {
  useUpdateEmployeeStep5,
  useGetEmployeeById,
} from "@/lib/db/services/employee";
import { UpdateEmployeeStep5Schema } from "@/lib/db/services/employee/employee.schemas";
import { useStepperForm } from "@/context";
import { useFileUpload } from "@/hooks";
import { devError, devWarn } from "@/utils/helpers/functions";

interface UseStep5LogicProps {
  employeeId?: number | null;
}

export const useStep5Logic = ({ employeeId }: UseStep5LogicProps) => {
  const { setIsSubmitting } = useStepperForm();

  const { mutateAsync: updateEmployee } = useUpdateEmployeeStep5();
  const {
    data: foundEmployee,
    isLoading: isLoadingEmployee,
    refetch: refetchEmployee,
  } = useGetEmployeeById({
    id: employeeId ?? 0,
  });

  const defaultValues = {
    id: employeeId ?? 0,
    isCardDelivered: false,
    cardDocument: "",
  };

  const form = useForm({
    resolver: zodResolver(UpdateEmployeeStep5Schema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  // File upload hook for card document
  const cardDocUpload = useFileUpload({
    existingFilePath: foundEmployee?.cardDocument || null,
    bucket: STORAGE_CONFIG.EMPLOYEES_BUCKET,
    folder: "documents/cards",
    acceptedTypes: [...FILE_TYPES.IMAGES, "application/pdf"],
    maxSizeMB: 10,
    isPublic: false,
    onUploadSuccess: (filePath) => {
      setValue("cardDocument", filePath);
    },
  });

  // Load employee data when in edit mode
  useEffect(() => {
    if (foundEmployee && employeeId) {
      const setEmployee = {
        id: foundEmployee.id,
        isCardDelivered: foundEmployee.isCardDelivered ?? false,
        cardDocument: foundEmployee.cardDocument || "",
      };
      reset(setEmployee);
    }
  }, [foundEmployee, employeeId, reset]);

  const handleFormSubmit = async (data: any): Promise<boolean> => {
    if (!employeeId) {
      toastService.showError("Error", "Employee ID is required");
      return false;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        cardDocument: cardDocUpload.shouldDelete
          ? ""
          : cardDocUpload.selectedFile
            ? ""
            : data.cardDocument || "",
      };

      await updateEmployee(submitData);
      toastService.showSuccess("Success", "Employee updated successfully");

      if (
        cardDocUpload.selectedFile &&
        employeeId &&
        !cardDocUpload.shouldDelete
      ) {
        try {
          await cardDocUpload.uploadFileAfterSave(
            employeeId,
            async (updateData: any) => {
              await updateEmployee(updateData);
            },
            {
              isCardDelivered: data.isCardDelivered,
            },
            "cardDocument"
          );
        } catch (error: any) {
          devWarn("Failed to upload card document:", error);
        }
      }

      if (cardDocUpload.shouldDelete) {
        cardDocUpload.clearDeletion();
        await refetchEmployee();
      }

      return true;
    } catch (error: any) {
      devError("Error:", error);
      toastService.showError(
        "Error",
        getErrorMessage(error) || "Failed to save employee"
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormSubmit = handleSubmit(handleFormSubmit);

  const isCardDeliveredOptions = [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  const cardDocPickerValue = useMemo(() => {
    const existing = cardDocUpload.getExistingFileObject();
    return cardDocUpload.selectedFile
      ? [cardDocUpload.selectedFile]
      : existing
        ? [existing]
        : [];
  }, [cardDocUpload.selectedFile, cardDocUpload.getExistingFileObject()]);

  return {
    form,
    errors,
    isLoadingEmployee,
    cardDocUpload,
    cardDocPickerValue,
    isCardDeliveredOptions,
    handleFormSubmit,
    onFormSubmit,
    handleSubmit,
  };
};
