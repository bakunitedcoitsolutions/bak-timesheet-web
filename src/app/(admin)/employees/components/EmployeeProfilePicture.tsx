"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getSignedUrl } from "@/utils/helpers";
import { devError } from "@/utils/helpers/functions";
import { STORAGE_CONFIG } from "@/utils/constants";

const RenderDot = ({ statusId }: { statusId: number | null }) => {
  if (statusId === 1) {
    return (
      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-theme-green rounded-full" />
    );
  }
  if (statusId === 7) {
    return (
      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-theme-red rounded-full" />
    );
  }
  if (statusId === 4) {
    return (
      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-400 rounded-full" />
    );
  }
  return null;
};

interface EmployeeProfilePictureProps {
  statusId: number | null;
  profilePicture: string | null;
  employeeName: string;
}

export const EmployeeProfilePicture = ({
  statusId,
  profilePicture,
  employeeName,
}: EmployeeProfilePictureProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profilePicture) {
      setIsLoading(false);
      return;
    }

    // Check if it's already a URL
    if (profilePicture.startsWith("http")) {
      setImageUrl(profilePicture);
      setIsLoading(false);
      return;
    }

    // Generate signed URL for private file
    getSignedUrl(STORAGE_CONFIG.EMPLOYEES_BUCKET, profilePicture, 3600)
      .then((signedUrl) => {
        setImageUrl(signedUrl);
      })
      .catch((error) => {
        devError("Failed to get signed URL:", error);
        setImageUrl(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [profilePicture]);

  if (isLoading) {
    return (
      <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shrink-0">
        <i className="pi pi-spin pi-spinner text-gray-400 text-sm"></i>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
        <RenderDot statusId={statusId} />
        <Image
          width={48}
          height={48}
          src={imageUrl}
          alt={employeeName || "Employee"}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shrink-0 relative">
      <RenderDot statusId={statusId} />
      <i className="pi pi-user text-gray-400 text-xl"></i>
    </div>
  );
};
