"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { classNames } from "primereact/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  UserPrivileges,
  ReportsPrivileges,
  FeaturePermissions,
} from "@/utils/dummy";
import {
  useUpdateUser,
  useCreateUser,
  useGetUserById,
} from "@/lib/db/services/user/requests";
import { useGetBranches } from "@/lib/db/services/branch/requests";
import { useGetUserRoles } from "@/lib/db/services/user-role/requests";
import type { ListedBranch } from "@/lib/db/services/branch/branch.dto";
import type { UserRoleInterface } from "@/lib/db/services/user-role/user-role.service";
import {
  CreateUserSchema,
  UpdateUserSchema,
} from "@/lib/db/services/user/user.schemas";
import {
  handleReportToggle as toggleReport,
  handleFeatureToggle as toggleFeature,
  isFeatureEnabled as checkFeatureEnabled,
  handlePrivilegeChange as changePrivilege,
  handleReportFilterToggle as toggleReportFilter,
} from "@/utils/helpers/user-privileges";
import { toastService } from "@/lib/toast";
import { getEntityModeFromParam } from "@/helpers";
import { generatePassword, getErrorMessage } from "@/utils/helpers";
import { FORM_FIELD_WIDTHS, STATUS_OPTIONS } from "@/utils/constants";
import { Input, Button, Dropdown, Form, FormItem } from "@/components/forms";
import { Privileges, ReportsSection, StepperFormHeading } from "@/components";

const UpsertUserPage = () => {
  const [privileges, setPrivileges] = useState<UserPrivileges>({});

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

  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: updateUser } = useUpdateUser();
  const { data: foundUser, isLoading } = useGetUserById({
    id: userId ? Number(userId) : 0,
  });

  // Fetch branches and user roles
  const { data: branchesData, isLoading: isLoadingBranches } = useGetBranches({
    page: 1,
    limit: 1000, // Get all branches
  });
  const { data: userRolesData, isLoading: isLoadingUserRoles } =
    useGetUserRoles();

  const defaultValues = {
    ...(isEditMode ? { id: 0 } : {}),
    nameEn: "",
    nameAr: "",
    email: "",
    password: "",
    userRoleId: 0,
    isActive: true,
    branchId: 0,
    privileges: null,
    createdBy: 0,
  };

  const zodSchema = isEditMode ? UpdateUserSchema : CreateUserSchema;

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = form;

  const selectedUserRoleId = watch("userRoleId");

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  // Reset privileges when role changes
  useEffect(() => {
    setPrivileges({});
  }, [selectedUserRoleId]);

  useEffect(() => {
    if (foundUser) {
      const setUser = {
        ...(isEditMode ? { id: foundUser?.id ?? 0 } : {}),
        nameEn: foundUser?.nameEn,
        nameAr: foundUser?.nameAr,
        email: foundUser?.email,
        userRoleId: foundUser?.userRoleId ?? 0,
        isActive: foundUser?.isActive,
        branchId: foundUser?.branchId ?? 0,
        privileges: foundUser?.privileges?.privileges ?? null,
        password: "",
      };
      reset(setUser);
      if (foundUser?.userRole?.id === 4) {
        setTimeout(() => {
          setPrivileges(foundUser?.privileges?.privileges ?? {});
        }, 300);
      }
    }
  }, [foundUser]);

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
    setValue("password", generatedPassword);
    clearErrors("password");
  };

  const onFormSubmit = handleSubmit(async (data) => {
    const submitData = {
      ...data,
      email: data?.email?.toLowerCase?.()?.trim?.(),
      privileges: selectedUserRoleId === 4 ? privileges : undefined, // Include privileges if Access-Enabled User role
    };
    if (isAddMode) {
      await handleAddUser(submitData);
    } else {
      await handleUpdateUser(submitData);
    }
  });

  const handleAddUser = async (data: Record<string, any>) => {
    try {
      console.log("Form submitted: Add User", data);
      await createUser(data, {
        onSuccess: () => {
          toastService.showSuccess("Success", "User created successfully");
          reset(defaultValues);
          router.replace("/users");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(error, "Failed to create user");
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {}
  };

  const handleUpdateUser = async (data: Record<string, any>) => {
    console.log("Form submitted: Update User", data);
    try {
      await updateUser(data, {
        onSuccess: () => {
          toastService.showSuccess("Success", "User updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(error, "Failed to update user");
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {}
  };

  const branchOptions =
    branchesData?.branches?.map((branch: ListedBranch) => ({
      label: branch.nameEn,
      value: branch.id,
    })) || [];

  const userRoleOptions =
    userRolesData?.map((role: UserRoleInterface) => ({
      label: role.nameEn,
      value: role.id,
    })) || [];

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading title={isAddMode ? "Add User" : "Edit User"} />
        {isLoading || isLoadingBranches || isLoadingUserRoles ? (
          <div className="flex justify-center items-center h-full">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          </div>
        ) : (
          <>
            <Form
              form={form}
              className="w-full h-full content-start md:max-w-5xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-4 md:py-5 px-6 mt-5 md:mt-0 flex-1">
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="nameEn">
                    <Input
                      label="Name"
                      className="w-full"
                      placeholder="Enter name"
                    />
                  </FormItem>
                </div>
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="nameAr">
                    <Input
                      label="Arabic Name"
                      className="w-full text-right"
                      placeholder="أدخل الاسم بالعربية"
                    />
                  </FormItem>
                </div>
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="email">
                    <Input
                      type="email"
                      label="Email"
                      className="w-full"
                      disabled={isEditMode}
                      placeholder="Enter email"
                    />
                  </FormItem>
                </div>
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="userRoleId">
                    <Dropdown
                      label="User Role"
                      className="w-full"
                      placeholder="Choose"
                      options={userRoleOptions}
                    />
                  </FormItem>
                </div>
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="isActive">
                    <Dropdown
                      label="Status"
                      className="w-full"
                      placeholder="Choose"
                      options={STATUS_OPTIONS}
                    />
                  </FormItem>
                </div>
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="password">
                    <Input
                      className="w-full"
                      label="Set Password"
                      placeholder="Set/Generate password"
                      icon="pi pi-refresh"
                      iconPosition="right"
                      onIconClick={handleGeneratePassword}
                    />
                  </FormItem>
                </div>
                {selectedUserRoleId === 3 && (
                  <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                    <FormItem name="branchId">
                      <Dropdown
                        label="Branch"
                        className="w-full"
                        options={branchOptions}
                        placeholder="Choose Branch"
                      />
                    </FormItem>
                  </div>
                )}
                {selectedUserRoleId === 4 && (
                  <>
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
                  </>
                )}
              </div>
            </Form>

            <div className="flex items-center gap-3 justify-end px-6">
              <Button
                size="small"
                variant="text"
                disabled={isSubmitting}
                onClick={() => router.replace("/users")}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="solid"
                onClick={onFormSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-28 justify-center! gap-1"
              >
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpsertUserPage;
