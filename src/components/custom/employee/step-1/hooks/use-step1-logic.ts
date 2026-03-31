"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { toastService } from "@/lib/toast";
import { getErrorMessage } from "@/utils/helpers";
import { STORAGE_CONFIG } from "@/utils/constants";
import {
  useGetEmployeeById,
  useCreateEmployeeStep1,
  useUpdateEmployeeStep1,
} from "@/lib/db/services/employee";
import {
  CreateEmployeeStep1Schema,
  UpdateEmployeeStep1Schema,
} from "@/lib/db/services/employee/employee.schemas";
import { useFileUpload } from "@/hooks";
import { useAccess } from "@/components";
import { useStepperForm } from "@/context";
import { devConsole, devError } from "@/utils/helpers/functions";

interface UseStep1LogicProps {
  employeeId?: number | null;
  isAddMode?: boolean;
  isEditMode?: boolean;
  onStepComplete?: (employeeId: number) => void;
}

export const useStep1Logic = ({
  employeeId,
  isAddMode = true,
  isEditMode = false,
  onStepComplete,
}: UseStep1LogicProps) => {
  const { setIsSubmitting } = useStepperForm();
  const router = useRouter();
  const { isBranchScoped, branchId: userBranchId } = useAccess();

  const { mutateAsync: createEmployee } = useCreateEmployeeStep1();
  const { mutateAsync: updateEmployee } = useUpdateEmployeeStep1();
  const {
    data: foundEmployee,
    isLoading: isLoadingEmployee,
    refetch: refetchEmployee,
  } = useGetEmployeeById({
    id: employeeId ?? 0,
  });

  // Redirect to 404 page if the entity is not found
  useEffect(() => {
    if (isEditMode && !foundEmployee && !isLoadingEmployee) {
      router.replace("/404");
    }
  }, [isEditMode, foundEmployee, isLoadingEmployee, router]);

  // Redirect if branch user tries to access an employee from another branch
  useEffect(() => {
    if (
      isEditMode &&
      foundEmployee &&
      isBranchScoped &&
      foundEmployee.branchId !== userBranchId
    ) {
      toastService.showError(
        "Access Denied",
        "You do not have permission to access employees from other branches."
      );
      router.replace("/employees");
    }
  }, [isEditMode, foundEmployee, isBranchScoped, userBranchId]);

  const defaultValues = {
    ...(isEditMode ? { id: 0 } : {}),
    profilePicture: "",
    employeeCode: 0,
    nameEn: "",
    nameAr: "",
    dob: "",
    phone: "",
    reassignEmployeeCode: false,
  };

  const zodSchema = isEditMode
    ? UpdateEmployeeStep1Schema
    : CreateEmployeeStep1Schema;

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = form;

  // File upload hook for profile picture
  const fileUpload = useFileUpload({
    existingFilePath: foundEmployee?.profilePicture || null,
    bucket: STORAGE_CONFIG.EMPLOYEES_BUCKET,
    folder: STORAGE_CONFIG.EMPLOYEES_AVATARS_FOLDER,
    acceptedTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
      "image/heif",
    ],
    maxSizeMB: 5,
    isPublic: false,
    onUploadSuccess: (filePath) => {
      setValue("profilePicture", filePath);
    },
  });

  // Load employee data when in edit mode
  useEffect(() => {
    if (foundEmployee && isEditMode) {
      const setEmployee = {
        ...(isEditMode ? { id: foundEmployee?.id ?? 0 } : {}),
        profilePicture: foundEmployee?.profilePicture ?? "",
        employeeCode: foundEmployee?.employeeCode ?? 0,
        nameEn: foundEmployee?.nameEn ?? "",
        nameAr: foundEmployee?.nameAr ?? "",
        dob: foundEmployee?.dob
          ? new Date(foundEmployee.dob).toISOString().split("T")[0]
          : "",
        phone: foundEmployee?.phone ?? "",
        reassignEmployeeCode: false,
      };
      reset(setEmployee);
    }
  }, [foundEmployee, isEditMode, reset]);

  const handleFormSubmit = async (data: any): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        profilePicture: fileUpload.shouldDelete
          ? ""
          : fileUpload.selectedFile
            ? "" // New file selected, will upload after save
            : data.profilePicture || "", // Use existing or undefined
        employeeCode: data.employeeCode,
        dob: data.dob || undefined,
        phone: data.phone || undefined,
      };

      let result;
      if (isAddMode) {
        result = await createEmployee(submitData);
        toastService.showSuccess("Success", "Employee created successfully");
        onStepComplete?.(result.id);
      } else {
        await updateEmployee(submitData);
        toastService.showSuccess("Success", "Employee updated successfully");
        onStepComplete?.(employeeId!);
        result = { id: employeeId! };
      }

      // Only upload file AFTER successful database operation
      if (fileUpload.selectedFile && result?.id && !fileUpload.shouldDelete) {
        try {
          await fileUpload.uploadFileAfterSave(
            result.id,
            async (updateData: any) => {
              await updateEmployee(updateData);
            },
            {
              employeeCode: data.employeeCode,
              nameEn: data.nameEn,
              nameAr: data.nameAr,
              dob: data.dob || undefined,
              phone: data.phone || undefined,
            },
            "profilePicture"
          );
        } catch (error: any) {
          devConsole("Failed to upload profile picture after save:", error);
        }
      }

      if (fileUpload.shouldDelete) {
        fileUpload.clearDeletion();
        if (isEditMode) {
          await refetchEmployee();
        }
      }

      return true;
    } catch (error: any) {
      devError("Error:", error);
      let errorMessage = getErrorMessage(error) || "Failed to save employee";
      if (
        error?.message?.includes("transaction") ||
        error?.message?.includes("timeout") ||
        error?.message?.includes("Unable to start a transaction")
      ) {
        errorMessage =
          "Database connection timeout. Please try again in a moment.";
      }
      toastService.showError("Error", errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormSubmit = handleSubmit(handleFormSubmit);

  return {
    form,
    fileUpload,
    isLoadingEmployee,
    onFormSubmit,
    handleFormSubmit,
    handleSubmit,
    errors,
  };
};
