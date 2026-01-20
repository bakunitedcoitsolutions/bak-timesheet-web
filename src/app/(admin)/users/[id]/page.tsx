"use client";

import { useEffect, useState } from "react";
import { classNames } from "primereact/utils";
import { useParams, useRouter } from "next/navigation";

import {
  branchesData,
  userRolesData,
  UserPrivileges,
  FeaturePermissions,
  ReportsPrivileges,
} from "@/utils/dummy";
import {
  handleReportToggle as toggleReport,
  handleFeatureToggle as toggleFeature,
  isFeatureEnabled as checkFeatureEnabled,
  handlePrivilegeChange as changePrivilege,
  handleReportFilterToggle as toggleReportFilter,
} from "@/utils/helpers/user-privileges";
import { generatePassword } from "@/utils/helpers";
import { getEntityModeFromParam } from "@/helpers";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { Input, Button, Dropdown } from "@/components/forms";
import { Privileges, ReportsSection, StepperFormHeading } from "@/components";

const statusOptions = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
];

const UpsertUserPage = () => {
  const [selectedUserRole, setSelectedUserRole] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [privileges, setPrivileges] = useState<UserPrivileges>({});
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const { id: userIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: userId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: userIdParam,
  });

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  // Reset privileges when role changes
  useEffect(() => {
    setPrivileges({});
  }, [selectedUserRole]);

  // Wrapper functions that use the helpers with local state
  const isFeatureEnabled = (featureKey: keyof UserPrivileges): boolean => {
    return checkFeatureEnabled(featureKey, privileges);
  };

  const handleFeatureToggle = (
    featureKey: keyof UserPrivileges,
    enabled: boolean
  ) => {
    toggleFeature(featureKey, enabled, setPrivileges);
  };

  const handlePrivilegeChange = (
    featureKey: keyof UserPrivileges,
    permissionKey: keyof FeaturePermissions,
    checked: boolean
  ) => {
    changePrivilege(featureKey, permissionKey, checked, setPrivileges);
  };

  // Wrapper functions for report handlers
  const handleReportToggle = (reportId: string, enabled: boolean) => {
    toggleReport(reportId, enabled, setPrivileges);
  };

  const handleReportFilterToggle = (
    reportId: string,
    filterKey: string,
    enabled: boolean
  ) => {
    toggleReportFilter(reportId, filterKey, enabled, setPrivileges);
  };

  // Generate random password
  const handleGeneratePassword = () => {
    const generatedPassword = generatePassword();
    setPassword(generatedPassword);
  };

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Form submitted:", data, privileges);
    // Handle form submission here
    // router.replace(`/users`);
  };

  const branchOptions = branchesData.map((branch) => ({
    label: branch.nameEn,
    value: branch.id,
  }));

  const userRoleOptions = userRolesData.map((role) => ({
    label: role.nameEn,
    value: role.id,
  }));

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading title={isAddMode ? "Add User" : "Edit User"} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-8 md:py-5 px-6 mt-5 md:mt-0 w-full md:max-w-5xl content-start flex-1">
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input label="Name" className="w-full" placeholder="Enter name" />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input
              label="Arabic Name"
              className="w-full text-right"
              placeholder="أدخل الاسم بالعربية"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input
              label="Email"
              className="w-full"
              placeholder="Enter email"
              type="email"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Dropdown
              label="User Role"
              className="w-full"
              options={userRoleOptions}
              placeholder="Choose"
              selectedItem={selectedUserRole}
              setSelectedItem={setSelectedUserRole}
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Dropdown
              label="Status"
              className="w-full"
              options={statusOptions}
              placeholder="Choose"
              selectedItem={selectedStatus}
              setSelectedItem={setSelectedStatus}
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input
              className="w-full"
              label="Set Password"
              placeholder="Set/Generate password"
              icon="pi pi-refresh"
              iconPosition="right"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onIconClick={handleGeneratePassword}
            />
          </div>
          {selectedUserRole === 3 && (
            <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
              <Dropdown
                label="Branch"
                className="w-full"
                options={branchOptions}
                placeholder="Choose Branch"
                selectedItem={selectedBranch}
                setSelectedItem={setSelectedBranch}
              />
            </div>
          )}
          {selectedUserRole === 4 && (
            <>
              <Privileges
                privileges={privileges}
                isFeatureEnabled={isFeatureEnabled}
                handleFeatureToggle={handleFeatureToggle}
                handlePrivilegeChange={handlePrivilegeChange}
              />
            </>
          )}
          {/* Separate Reports Section - shown when Reports feature is enabled */}
          {selectedUserRole === 4 && isFeatureEnabled("reports") && (
            <ReportsSection
              privileges={privileges.reports as ReportsPrivileges}
              handleReportToggle={handleReportToggle}
              handleReportFilterToggle={handleReportFilterToggle}
            />
          )}
        </div>

        <div className="flex items-center gap-3 justify-end px-6">
          <Button
            size="small"
            variant="text"
            onClick={() => router.replace("/users")}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="solid"
            onClick={handleSubmit}
            className="w-28 justify-center!"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpsertUserPage;
