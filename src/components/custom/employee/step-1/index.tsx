"use client";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classNames } from "primereact/utils";
import { ProgressSpinner } from "primereact/progressspinner";

import { FORM_FIELD_WIDTHS, STORAGE_CONFIG } from "@/utils/constants";
import MaskInput from "@/components/forms/mask-input";
import { StepperFormHeading } from "@/components/common";
import {
  Checkbox,
  FilePicker,
  Form,
  FormItem,
  Input,
  NumberInput,
} from "@/components/forms";
import { getErrorMessage } from "@/utils/helpers";
import { toastService } from "@/lib/toast";
import {
  useCreateEmployeeStep1,
  useUpdateEmployeeStep1,
  useGetEmployeeById,
} from "@/lib/db/services/employee";
import {
  CreateEmployeeStep1Schema,
  UpdateEmployeeStep1Schema,
} from "@/lib/db/services/employee/employee.schemas";
import { useStepperForm } from "@/context";
import { useFileUpload } from "@/hooks";
import { useRouter } from "next/navigation";

interface Step1Props {
  employeeId?: number | null;
  isAddMode?: boolean;
  isEditMode?: boolean;
  onStepComplete?: (employeeId: number) => void;
}

export interface Step1Handle {
  submit: () => Promise<boolean>;
}

const Step1 = forwardRef<Step1Handle, Step1Props>(
  (
    { employeeId, isAddMode = true, isEditMode = false, onStepComplete },
    ref
  ) => {
    const { setIsSubmitting } = useStepperForm();
    const router = useRouter();
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
        // First, create/update employee without uploading file
        // This ensures we don't have orphaned files if validation fails
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
            // Profile picture is optional, don't fail the whole operation
            console.warn("Failed to upload profile picture after save:", error);
          }
        }

        // Clear delete flag and refetch after successful save
        if (fileUpload.shouldDelete) {
          fileUpload.clearDeletion();
          if (isEditMode) {
            await refetchEmployee();
          }
        }

        return true;
      } catch (error: any) {
        console.error("Error:", error);

        // Provide more specific error messages for transaction timeouts
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

    // Expose submit method via ref for StepperForm to call
    // This allows the parent StepperForm to trigger form submission
    // when "Save & Proceed" button is clicked (which is outside the form)
    useImperativeHandle(ref, () => ({
      submit: async () => {
        return new Promise<boolean>((resolve) => {
          // Get form values and validate
          handleSubmit(async (data) => {
            const result = await handleFormSubmit(data);
            resolve(result);
          })();
        });
      },
    }));

    const renderProfilePicture = () => {
      const existingFile = fileUpload.getExistingFileObject();
      const filePickerValue = fileUpload.selectedFile
        ? [fileUpload.selectedFile]
        : existingFile
          ? [existingFile]
          : [];

      return (
        <div className="space-y-2 gap-4 px-6">
          <label className="block text-[15px] ml-1">Profile Picture</label>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-full">
              <img
                alt="user"
                className="w-16 h-16 rounded-full object-cover"
                src={
                  fileUpload.displayUrl
                    ? fileUpload.displayUrl
                    : fileUpload.selectedFile
                      ? URL.createObjectURL(fileUpload.selectedFile)
                      : "/assets/icons/user-icon.jpg"
                }
              />
            </div>
            <div className="min-w-60 md:min-w-72 flex-1">
              <FilePicker
                multiple={false}
                className="w-full"
                disabled={fileUpload.isUploading}
                dropText="Drop your picture here or"
                browseText="browse"
                value={filePickerValue}
                accept={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                  "image/gif": [".gif"],
                  "image/webp": [".webp"],
                  "image/heic": [".heic"],
                  "image/heif": [".heif"],
                }}
                onFileSelect={fileUpload.handleFileSelect}
              />
            </div>
          </div>
        </div>
      );
    };

    if (isLoadingEmployee && isEditMode) {
      return (
        <div className="flex items-center justify-center h-full">
          <ProgressSpinner />
        </div>
      );
    }

    return (
      <Form form={form} onSubmit={onFormSubmit}>
        <div className="flex flex-1 md:flex-none flex-col gap-4 py-6">
          <StepperFormHeading title="Basic Info" />
          <div className="flex flex-col xl:flex-row gap-2">
            {renderProfilePicture()}
            <div
              className={classNames(
                FORM_FIELD_WIDTHS["2"],
                "px-6 mt-4 xl:pl-0 xl:mt-0"
              )}
            >
              <FormItem name="employeeCode" className="mt-1.5 mb-1">
                <NumberInput
                  label="Employee Code"
                  useGrouping={false}
                  labelClassName="mb-2!"
                  className="w-full md:w-60 xl:w-72"
                  placeholder="Enter employee code"
                />
              </FormItem>
              <FormItem name="reassignEmployeeCode" valueName="checked">
                <Checkbox
                  name="Override"
                  label="Override"
                  labelClassName="mt-0.5!"
                />
              </FormItem>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-8 md:py-5 px-6">
            <FormItem name="nameEn">
              <Input
                label="Full Name (En)"
                className="w-full"
                placeholder="Enter full name in English"
              />
            </FormItem>
            <FormItem name="nameAr">
              <Input
                label="Full Name (Ar)"
                className="w-full text-right"
                placeholder="أدخل الاسم الكامل بالعربية"
              />
            </FormItem>
            <FormItem name="dob">
              <Input
                label="Birth Date"
                type="date"
                className="w-full"
                placeholder="Select birth date"
              />
            </FormItem>
            <FormItem name="phone">
              <MaskInput
                label="Mobile Number"
                className="w-full"
                mask="999 999 9999"
                placeholder="Enter mobile number (without 966/+966)"
              />
            </FormItem>
          </div>
        </div>
      </Form>
    );
  }
);

Step1.displayName = "Step1";

export default Step1;
