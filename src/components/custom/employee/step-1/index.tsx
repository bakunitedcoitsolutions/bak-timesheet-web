"use client";
import { useState } from "react";
import { classNames } from "primereact/utils";

import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import MaskInput from "@/components/forms/mask-input";
import { StepperFormHeading } from "@/components/common";
import { Checkbox, FilePicker, Input, NumberInput } from "@/components/forms";
import {
  FILE_TYPES,
  uploadFile,
  validateFileType,
  validateFileSize,
  FILE_SIZE_LIMITS,
} from "@/utils/helpers";
import { toastService } from "@/lib/toast";

const Step1 = () => {
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (files: File[]) => {
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

    // Set file for preview
    setProfilePicture(file);
    setIsUploading(true);

    try {
      // Upload file to Supabase Storage
      // Note: Make sure the "employee-profiles" bucket exists in Supabase Storage
      // If not, create it in Supabase Dashboard > Storage
      const result = await uploadFile(file, {
        bucket: "employees", // Create this bucket in Supabase Storage if it doesn't exist
        folder: "avatars",
        isPublic: true,
      });

      // Save the uploaded URL
      setUploadedImageUrl(result.url);
      console.log("File uploaded successfully:", result);
      toastService.showSuccess(
        "Success",
        "Profile picture uploaded successfully"
      );

      // TODO: Save result.url to database when submitting the form
    } catch (error: any) {
      console.error("Upload error:", error);
      toastService.showError(
        "Upload Failed",
        error?.message || "Failed to upload profile picture"
      );
      setProfilePicture(null);
      setUploadedImageUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

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

  return (
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
          <label className={`block text-[15px] ml-1 xl:mt-[12px] mb-[8px]`}>
            Emp. Code
          </label>
          <NumberInput
            useGrouping={false}
            className="w-full md:w-60 xl:w-72 mb-3"
            placeholder="Enter employee code"
          />
          <Checkbox label="Override" labelClassName="mt-0.5!" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-8 md:py-5 px-6">
        <div className={classNames(FORM_FIELD_WIDTHS["2"], "xl:min-w-83.5!")}>
          <Input
            label="Full Name (En)"
            className="w-full"
            placeholder="Enter full name in English"
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["2"], "xl:min-w-83.5!")}>
          <Input
            label="Full Name (Ar)"
            className="w-full text-right"
            placeholder="أدخل الاسم الكامل بالعربية"
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["2"], "xl:min-w-83.5!")}>
          <Input
            label="Birth Date"
            type="date"
            className="w-full"
            placeholder="Select birth date"
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["2"], "xl:min-w-83.5!")}>
          <MaskInput
            className="w-full"
            mask="999 999 9999"
            label="Mobile Number"
            placeholder="Enter mobile number (without 966/+966)"
          />
        </div>
      </div>
    </div>
  );
};

export default Step1;
