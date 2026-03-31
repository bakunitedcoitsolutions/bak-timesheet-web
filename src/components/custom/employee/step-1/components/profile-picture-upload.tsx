"use client";
import React from "react";

import { FilePicker } from "@/components/forms";

interface ProfilePictureUploadProps {
  fileUpload: any; // Using any for now, but should ideally be the return type of useFileUpload
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  fileUpload,
}) => {
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

export default ProfilePictureUpload;
