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
  Input,
  NumberInput,
} from "@/components/forms";
import { getErrorMessage, FILE_TYPES } from "@/utils/helpers";
import { toastService } from "@/lib/toast";
import {
  useUpdateEmployeeStep3,
  useGetEmployeeById,
} from "@/lib/db/services/employee";
import { useGetCountries } from "@/lib/db/services/country";
import type { ListedCountry } from "@/lib/db/services/country/country.dto";
import { UpdateEmployeeStep3Schema } from "@/lib/db/services/employee/employee.schemas";
import { useStepperForm } from "@/context";
import { useFileUpload } from "@/hooks";

interface Step3Props {
  employeeId?: number | null;
}

export interface Step3Handle {
  submit: () => Promise<boolean>;
}

const Step3 = forwardRef<Step3Handle, Step3Props>(({ employeeId }, ref) => {
  const { setIsSubmitting } = useStepperForm();

  const { mutateAsync: updateEmployee } = useUpdateEmployeeStep3();
  const {
    data: foundEmployee,
    isLoading: isLoadingEmployee,
    refetch: refetchEmployee,
  } = useGetEmployeeById({
    id: employeeId ?? 0,
  });

  // Fetch countries for nationality dropdown
  const { data: countriesData } = useGetCountries({ page: 1, limit: 1000 });

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
      // Prepare submit data
      const submitData = {
        ...data,
        idCardDocument: idCardDocUpload.shouldDelete
          ? ""
          : idCardDocUpload.selectedFile
            ? "" // Will upload after save
            : data.idCardDocument || "",
        passportDocument: passportDocUpload.shouldDelete
          ? ""
          : passportDocUpload.selectedFile
            ? "" // Will upload after save
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
          console.warn("Failed to upload ID card document:", error);
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
          console.warn("Failed to upload passport document:", error);
        }
      }

      // Clear delete flags after successful save
      if (idCardDocUpload.shouldDelete) {
        idCardDocUpload.clearDeletion();
      }
      if (passportDocUpload.shouldDelete) {
        passportDocUpload.clearDeletion();
      }

      if (idCardDocUpload.shouldDelete || passportDocUpload.shouldDelete) {
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

  // Prepare nationality dropdown options
  const nationalityOptions =
    countriesData?.countries.map((country: ListedCountry) => ({
      label: country.nameEn,
      value: country.id,
    })) || [];

  if (isLoadingEmployee) {
    return (
      <div className="flex items-center justify-center h-full">
        <ProgressSpinner />
      </div>
    );
  }

  const existingIdCardDoc = idCardDocUpload.getExistingFileObject();
  const idCardDocPickerValue = idCardDocUpload.selectedFile
    ? [idCardDocUpload.selectedFile]
    : existingIdCardDoc
      ? [existingIdCardDoc]
      : [];

  const existingPassportDoc = passportDocUpload.getExistingFileObject();
  const passportDocPickerValue = passportDocUpload.selectedFile
    ? [passportDocUpload.selectedFile]
    : existingPassportDoc
      ? [existingPassportDoc]
      : [];

  return (
    <Form form={form} onSubmit={onFormSubmit}>
      <div className="flex flex-1 md:flex-none flex-col gap-10 py-6">
        <div className="flex flex-col gap-4">
          <StepperFormHeading title="Identity" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
            <FormItem
              name="idCardNo"
              className={classNames(FORM_FIELD_WIDTHS["2"])}
            >
              <Input
                className="w-full"
                label="ID Card No."
                placeholder="Enter ID card number"
              />
            </FormItem>
            <FormItem
              name="idCardExpiryDate"
              className={classNames(FORM_FIELD_WIDTHS["2"])}
            >
              <Input
                type="date"
                className="w-full"
                label="ID Card Expiry Date"
                placeholder="Enter ID card expiry date"
              />
            </FormItem>
            <FormItem
              name="profession"
              className={classNames(FORM_FIELD_WIDTHS["2"])}
            >
              <Input
                className="w-full"
                label="Profession"
                placeholder="Enter profession"
              />
            </FormItem>
            <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
              <FilePicker
                multiple={false}
                className="w-full"
                label="ID Card Document"
                disabled={idCardDocUpload.isUploading}
                dropText="Drop your document here or"
                browseText="browse"
                value={idCardDocPickerValue}
                accept={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                  "application/pdf": [".pdf"],
                }}
                onFileSelect={idCardDocUpload.handleFileSelect}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <StepperFormHeading title="Passport" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
            <FormItem
              name="nationalityId"
              className={classNames(FORM_FIELD_WIDTHS["2"])}
            >
              <Dropdown
                label="Nationality"
                className="w-full"
                options={nationalityOptions}
                placeholder="Choose"
              />
            </FormItem>
            <FormItem
              name="passportNo"
              className={classNames(FORM_FIELD_WIDTHS["2"])}
            >
              <Input
                className="w-full uppercase placeholder:normal-case"
                label="Passport No."
                placeholder="Enter passport number"
              />
            </FormItem>
            <FormItem
              name="passportExpiryDate"
              className={classNames(FORM_FIELD_WIDTHS["2"])}
            >
              <Input
                type="date"
                className="w-full"
                label="Passport Expiry Date"
                placeholder="Enter passport expiry date"
              />
            </FormItem>
            <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
              <FilePicker
                multiple={false}
                className="w-full"
                label="Passport Document"
                disabled={passportDocUpload.isUploading}
                dropText="Drop your document here or"
                browseText="browse"
                value={passportDocPickerValue}
                accept={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                  "application/pdf": [".pdf"],
                }}
                onFileSelect={passportDocUpload.handleFileSelect}
              />
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
});

Step3.displayName = "Step3";

export default Step3;
