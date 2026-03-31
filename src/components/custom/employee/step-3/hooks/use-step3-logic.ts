"use client";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { STORAGE_CONFIG } from "@/utils/constants";
import { toastService } from "@/lib/toast";
import { getErrorMessage, FILE_TYPES } from "@/utils/helpers";
import {
  useUpdateEmployeeStep3,
  useGetEmployeeById,
} from "@/lib/db/services/employee";
import { UpdateEmployeeStep3Schema } from "@/lib/db/services/employee/employee.schemas";
import { useStepperForm } from "@/context";
import { useFileUpload } from "@/hooks";
import { GlobalDataGeneral, useGlobalData } from "@/context/GlobalDataContext";
import { devError, devWarn } from "@/utils/helpers/functions";

interface UseStep3LogicProps {
  employeeId?: number | null;
}

export const useStep3Logic = ({ employeeId }: UseStep3LogicProps) => {
  const { setIsSubmitting } = useStepperForm();

  const { mutateAsync: updateEmployee } = useUpdateEmployeeStep3();
  const {
    data: foundEmployee,
    isLoading: isLoadingEmployee,
    refetch: refetchEmployee,
  } = useGetEmployeeById({
    id: employeeId ?? 0,
  });

  const { data: globalData } = useGlobalData();

  const defaultValues = {
    id: employeeId ?? 0,
    idCardNo: "",
    idCardExpiryDate: "",
    idCardDocument: "",
    profession: "",
    nationalityId: undefined,
    passportNo: "",
    passportExpiryDate: "",
    passportDocument: "",
  };

  const form = useForm({
    resolver: zodResolver(UpdateEmployeeStep3Schema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  // File upload hooks
  const idCardDocUpload = useFileUpload({
    existingFilePath: foundEmployee?.idCardDocument || null,
    bucket: STORAGE_CONFIG.EMPLOYEES_BUCKET,
    folder: "documents/id-cards",
    acceptedTypes: [...FILE_TYPES.IMAGES, "application/pdf"],
    maxSizeMB: 10,
    isPublic: false,
    onUploadSuccess: (filePath) => {
      setValue("idCardDocument", filePath);
    },
  });

  const passportDocUpload = useFileUpload({
    existingFilePath: foundEmployee?.passportDocument || null,
    bucket: STORAGE_CONFIG.EMPLOYEES_BUCKET,
    folder: "documents/passports",
    acceptedTypes: [...FILE_TYPES.IMAGES, "application/pdf"],
    maxSizeMB: 10,
    isPublic: false,
    onUploadSuccess: (filePath) => {
      setValue("passportDocument", filePath);
    },
  });

  // Load employee data when in edit mode
  useEffect(() => {
    if (foundEmployee && employeeId) {
      const setEmployee = {
        id: foundEmployee.id,
        idCardNo: foundEmployee.idCardNo || "",
        idCardExpiryDate: foundEmployee.idCardExpiryDate
          ? new Date(foundEmployee.idCardExpiryDate).toISOString().split("T")[0]
          : "",
        idCardDocument: foundEmployee.idCardDocument || "",
        profession: foundEmployee.profession || "",
        nationalityId: foundEmployee.nationalityId || undefined,
        passportNo: foundEmployee.passportNo || "",
        passportExpiryDate: foundEmployee.passportExpiryDate
          ? new Date(foundEmployee.passportExpiryDate)
              .toISOString()
              .split("T")[0]
          : "",
        passportDocument: foundEmployee.passportDocument || "",
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
        idCardDocument: idCardDocUpload.shouldDelete
          ? ""
          : idCardDocUpload.selectedFile
            ? ""
            : data.idCardDocument || "",
        passportDocument: passportDocUpload.shouldDelete
          ? ""
          : passportDocUpload.selectedFile
            ? ""
            : data.passportDocument || "",
        idCardExpiryDate: data.idCardExpiryDate || undefined,
        passportExpiryDate: data.passportExpiryDate || undefined,
      };

      await updateEmployee(submitData);
      toastService.showSuccess("Success", "Employee updated successfully");

      // Upload ID Card document if new file selected
      if (
        idCardDocUpload.selectedFile &&
        employeeId &&
        !idCardDocUpload.shouldDelete
      ) {
        try {
          await idCardDocUpload.uploadFileAfterSave(
            employeeId,
            async (updateData: any) => {
              await updateEmployee(updateData);
            },
            {
              idCardNo: data.idCardNo,
              idCardExpiryDate: data.idCardExpiryDate,
              profession: data.profession,
              nationalityId: data.nationalityId,
              passportNo: data.passportNo,
              passportExpiryDate: data.passportExpiryDate,
              passportDocument: submitData.passportDocument,
            },
            "idCardDocument"
          );
        } catch (error: any) {
          devWarn("Failed to upload ID card document:", error);
        }
      }

      // Upload Passport document if new file selected
      if (
        passportDocUpload.selectedFile &&
        employeeId &&
        !passportDocUpload.shouldDelete
      ) {
        try {
          await passportDocUpload.uploadFileAfterSave(
            employeeId,
            async (updateData: any) => {
              await updateEmployee(updateData);
            },
            {
              idCardNo: data.idCardNo,
              idCardExpiryDate: data.idCardExpiryDate,
              idCardDocument: submitData.idCardDocument,
              profession: data.profession,
              nationalityId: data.nationalityId,
              passportNo: data.passportNo,
              passportExpiryDate: data.passportExpiryDate,
            },
            "passportDocument"
          );
        } catch (error: any) {
          devWarn("Failed to upload passport document:", error);
        }
      }

      if (idCardDocUpload.shouldDelete) idCardDocUpload.clearDeletion();
      if (passportDocUpload.shouldDelete) passportDocUpload.clearDeletion();

      if (idCardDocUpload.shouldDelete || passportDocUpload.shouldDelete) {
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

  const nationalityOptions = useMemo(() => {
    return globalData.countries.map((country: GlobalDataGeneral) => ({
      label: country.nameEn,
      value: country.id,
    }));
  }, [globalData.countries]);

  const idCardDocPickerValue = useMemo(() => {
    const existing = idCardDocUpload.getExistingFileObject();
    return idCardDocUpload.selectedFile
      ? [idCardDocUpload.selectedFile]
      : existing
        ? [existing]
        : [];
  }, [idCardDocUpload.selectedFile, idCardDocUpload.getExistingFileObject()]);

  const passportDocPickerValue = useMemo(() => {
    const existing = passportDocUpload.getExistingFileObject();
    return passportDocUpload.selectedFile
      ? [passportDocUpload.selectedFile]
      : existing
        ? [existing]
        : [];
  }, [passportDocUpload.selectedFile, passportDocUpload.getExistingFileObject()]);

  return {
    form,
    errors,
    isLoadingEmployee,
    idCardDocUpload,
    idCardDocPickerValue,
    passportDocUpload,
    passportDocPickerValue,
    nationalityOptions,
    handleFormSubmit,
    onFormSubmit,
    handleSubmit,
  };
};
