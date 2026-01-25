"use client";
import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
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
import {
  FILE_TYPES,
  uploadFile,
  getSignedUrl,
  validateFileType,
  validateFileSize,
  FILE_SIZE_LIMITS,
  getErrorMessage,
} from "@/utils/helpers";
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
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(
      null
    );
    const [isUploading, setIsUploading] = useState(false);
    const { setIsSubmitting } = useStepperForm();

    const { mutateAsync: createEmployee } = useCreateEmployeeStep1();
    const { mutateAsync: updateEmployee } = useUpdateEmployeeStep1();
    const { data: foundEmployee, isLoading: isLoadingEmployee } =
      useGetEmployeeById({
        id: employeeId ?? 0,
      });

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
        // If profilePicture exists, it's already a signed URL (saved from upload)
        // or a file path that needs to be converted to signed URL
        if (foundEmployee.profilePicture) {
          // Check if it's a path (starts with folder/) or already a URL
          const avatarsFolderPrefix = `${STORAGE_CONFIG.EMPLOYEES_AVATARS_FOLDER}/`;
          if (
            foundEmployee.profilePicture.startsWith(avatarsFolderPrefix) ||
            !foundEmployee.profilePicture.startsWith("http")
          ) {
            // It's a file path, generate signed URL
            getSignedUrl(
              STORAGE_CONFIG.EMPLOYEES_BUCKET,
              foundEmployee.profilePicture,
              31536000
            )
              .then((signedUrl) => {
                setUploadedImageUrl(signedUrl);
              })
              .catch((error) => {
                console.error("Failed to get signed URL:", error);
                // Fallback to stored value
                setUploadedImageUrl(foundEmployee.profilePicture);
              });
          } else {
            // It's already a URL (signed URL or public URL)
            setUploadedImageUrl(foundEmployee.profilePicture);
          }
        }
      }
    }, [foundEmployee, isEditMode]);

    const handleFileSelect = (files: File[]) => {
      if (!files || files.length === 0) return;

      const file = files[0];

      // Validate file type
      if (!validateFileType(file, [...FILE_TYPES.IMAGES])) {
        toastService.showError(
          "Invalid File Type",
          "Please select a valid image file (JPEG, PNG, GIF, WebP, SVG, HEIC, HEIF)"
        );
        return;
      }

      // Validate file size (5MB limit for images)
      if (!validateFileSize(file, FILE_SIZE_LIMITS.IMAGE)) {
        toastService.showError(
          "File Too Large",
          `File size must be less than ${FILE_SIZE_LIMITS.IMAGE}MB`
        );
        return;
      }

      // Store file for upload on save (don't upload yet)
      setProfilePicture(file);
      // Clear previously uploaded URL if any
      setUploadedImageUrl(null);
    };

    /**
     * Uploads the profile picture file, updates the employee record, and returns the signed URL
     * This function should only be called AFTER successful employee creation/update
     */
    const uploadProfilePicture = async (
      employeeId: number,
      formData: any
    ): Promise<string> => {
      if (!profilePicture) {
        throw new Error("No file selected");
      }

      setIsUploading(true);
      try {
        // Upload as private file
        const uploadResult = await uploadFile(profilePicture, {
          bucket: STORAGE_CONFIG.EMPLOYEES_BUCKET,
          folder: STORAGE_CONFIG.EMPLOYEES_AVATARS_FOLDER,
          isPublic: false, // Private file
        });

        // Get signed URL for viewing (expires in 1 year)
        const signedUrl = await getSignedUrl(
          STORAGE_CONFIG.EMPLOYEES_BUCKET,
          uploadResult.path,
          31536000 // 1 year in seconds
        );

        // Update employee record with the uploaded file path
        // Include all required fields from the original data
        const updateData = {
          id: employeeId,
          profilePicture: uploadResult.path,
          employeeCode: formData.employeeCode, // Required field
          nameEn: formData.nameEn,
          nameAr: formData.nameAr,
          dob: formData.dob || undefined,
          phone: formData.phone || undefined,
        };

        await updateEmployee(updateData);

        // Update UI with signed URL for display
        setUploadedImageUrl(signedUrl);
        setValue("profilePicture", uploadResult.path);

        return signedUrl;
      } catch (error: any) {
        console.error("Upload error:", error);
        toastService.showError(
          "Upload Failed",
          error?.message || "Failed to upload profile picture"
        );
        throw error;
      } finally {
        setIsUploading(false);
      }
    };

    const handleFormSubmit = async (data: any): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        // First, create/update employee without uploading file
        // This ensures we don't have orphaned files if validation fails
        const submitData = {
          ...data,
          profilePicture: data.profilePicture || undefined, // Use existing or undefined, don't upload yet
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
        if (profilePicture && !uploadedImageUrl && result?.id) {
          try {
            await uploadProfilePicture(result.id, data);
          } catch (error: any) {
            // Profile picture is optional, don't fail the whole operation
            // Error already handled in uploadProfilePicture
            console.warn("Failed to upload profile picture after save:", error);
            // Employee is already saved, so we continue
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
      return (
        <div className="space-y-2 gap-4 px-6">
          <label className="block text-[15px] ml-1">Profile Picture</label>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-full relative">
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <span className="text-white text-xs">Uploading...</span>
                </div>
              )}
              <img
                alt="user"
                className="w-16 h-16 rounded-full object-cover"
                src={
                  uploadedImageUrl
                    ? uploadedImageUrl
                    : profilePicture
                      ? URL.createObjectURL(profilePicture)
                      : "/assets/icons/user-icon.jpg"
                }
              />
            </div>
            <div className="min-w-60 md:min-w-72">
              <FilePicker
                multiple={false}
                className="w-full"
                disabled={isUploading}
                dropText="Drop your picture here or"
                browseText="browse"
                accept={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                  "image/gif": [".gif"],
                  "image/webp": [".webp"],
                  "image/heic": [".heic"],
                  "image/heif": [".heif"],
                }}
                onFileSelect={handleFileSelect}
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
