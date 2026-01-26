"use client";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classNames } from "primereact/utils";
import { ProgressSpinner } from "primereact/progressspinner";

import { FORM_FIELD_WIDTHS, STORAGE_CONFIG } from "@/utils/constants";
import { StepperFormHeading } from "@/components/common";
import {
  Dropdown,
  FilePicker,
  Form,
  FormItem,
  NumberInput,
} from "@/components/forms";
import { getErrorMessage, FILE_TYPES } from "@/utils/helpers";
import { toastService } from "@/lib/toast";
import {
  useUpdateEmployeeStep5,
  useGetEmployeeById,
} from "@/lib/db/services/employee";
import { UpdateEmployeeStep5Schema } from "@/lib/db/services/employee/employee.schemas";
import { useStepperForm } from "@/context";
import { useFileUpload } from "@/hooks";

interface Step5Props {
  employeeId?: number | null;
}

export interface Step5Handle {
  submit: () => Promise<boolean>;
}

const Step5 = forwardRef<Step5Handle, Step5Props>(({ employeeId }, ref) => {
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
    openingBalance: undefined,
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
        openingBalance: foundEmployee.openingBalance
          ? Number(foundEmployee.openingBalance)
          : undefined,
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
      // Prepare submit data
      const submitData = {
        ...data,
        cardDocument: cardDocUpload.shouldDelete
          ? ""
          : cardDocUpload.selectedFile
            ? "" // Will upload after save
            : data.cardDocument || "",
        openingBalance: data.openingBalance || undefined,
      };

      await updateEmployee(submitData);
      toastService.showSuccess("Success", "Employee updated successfully");

      // Upload card document if new file selected
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
              openingBalance: data.openingBalance,
              isCardDelivered: data.isCardDelivered,
            },
            "cardDocument"
          );
        } catch (error: any) {
          console.warn("Failed to upload card document:", error);
        }
      }

      // Clear delete flag after successful save
      if (cardDocUpload.shouldDelete) {
        cardDocUpload.clearDeletion();
        await refetchEmployee();
      }

      return true;
    } catch (error: any) {
      console.error("Error:", error);
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

  // Expose submit method via ref
  useImperativeHandle(ref, () => ({
    submit: async () => {
      return new Promise<boolean>((resolve) => {
        handleSubmit(async (data) => {
          const result = await handleFormSubmit(data);
          resolve(result);
        })();
      });
    },
  }));

  if (isLoadingEmployee) {
    return (
      <div className="flex items-center justify-center h-full">
        <ProgressSpinner />
      </div>
    );
  }

  const existingCardDoc = cardDocUpload.getExistingFileObject();
  const cardDocPickerValue = cardDocUpload.selectedFile
    ? [cardDocUpload.selectedFile]
    : existingCardDoc
      ? [existingCardDoc]
      : [];

  const isCardDeliveredOptions = [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  return (
    <Form form={form} onSubmit={onFormSubmit}>
      <div className="flex flex-1 md:flex-none flex-col gap-10 py-6">
        <div className="flex flex-col gap-4">
          <StepperFormHeading title="Loan Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
            <FormItem
              name="openingBalance"
              className={classNames(FORM_FIELD_WIDTHS["2"])}
            >
              <NumberInput
                label="Opening Balance"
                className="w-full"
                useGrouping={false}
                placeholder="Enter opening balance"
              />
            </FormItem>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <StepperFormHeading title="Bank Card Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
            <FormItem
              name="isCardDelivered"
              className={classNames(FORM_FIELD_WIDTHS["2"])}
            >
              <Dropdown
                className="w-full"
                label="Is Card Delivered?"
                options={isCardDeliveredOptions}
                placeholder="Choose"
              />
            </FormItem>
            <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
              <div className="w-full md:w-60 xl:w-72">
                <FilePicker
                  multiple={false}
                  className="w-full"
                  label="Card Document"
                  disabled={cardDocUpload.isUploading}
                  dropText="Drop card document here or"
                  browseText="browse"
                  value={cardDocPickerValue}
                  accept={{
                    "image/jpeg": [".jpg", ".jpeg"],
                    "image/png": [".png"],
                    "application/pdf": [".pdf"],
                  }}
                  onFileSelect={cardDocUpload.handleFileSelect}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
});

Step5.displayName = "Step5";

export default Step5;
