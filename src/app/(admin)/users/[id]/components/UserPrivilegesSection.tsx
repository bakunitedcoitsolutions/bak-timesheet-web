"use client";
import React from "react";
import { UserPrivileges, FeaturePermissions, ReportsPrivileges } from "@/utils/user.utility";
import { Privileges, ReportsSection } from "@/components";

interface UserPrivilegesSectionProps {
  privileges: UserPrivileges;
  isFeatureEnabled: (featureKey: keyof UserPrivileges) => boolean;
  handleFeatureToggle: (featureKey: keyof UserPrivileges, enabled: boolean) => void;
  handlePrivilegeChange: (featureKey: keyof UserPrivileges, permissionKey: keyof FeaturePermissions, checked: boolean) => void;
  handleReportToggle: (reportId: string, enabled: boolean) => void;
  handleReportFilterToggle: (reportId: string, filterKey: string, enabled: boolean) => void;
  selectedUserRoleId: number;
}

export const UserPrivilegesSection = ({
  privileges,
  isFeatureEnabled,
  handleFeatureToggle,
  handlePrivilegeChange,
  handleReportToggle,
  handleReportFilterToggle,
  selectedUserRoleId,
}: UserPrivilegesSectionProps) => {
  if (selectedUserRoleId !== 4 && selectedUserRoleId !== 5) return null;

  return (
    <div className="flex flex-col gap-4 px-6 md:max-w-5xl">
      <Privileges
        privileges={privileges}
        isFeatureEnabled={isFeatureEnabled}
        handleFeatureToggle={handleFeatureToggle}
        handlePrivilegeChange={handlePrivilegeChange}
      />
      {/* Separate Reports Section - shown when Reports feature is enabled */}
      {isFeatureEnabled("reports") && (
        <ReportsSection
          privileges={privileges.reports as ReportsPrivileges}
          handleReportToggle={handleReportToggle}
          handleReportFilterToggle={handleReportFilterToggle}
        />
      )}
    </div>
  );
};
