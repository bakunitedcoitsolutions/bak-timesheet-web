"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  useUpdateUser,
  useCreateUser,
  useGetUserById,
} from "@/lib/db/services/user/requests";
import { useGlobalData, GlobalDataGeneral } from "@/context/GlobalDataContext";
import {
  CreateUserSchema,
  UpdateUserSchema,
} from "@/lib/db/services/user/user.schemas";
import { toastService } from "@/lib/toast";
import { getEntityModeFromParam } from "@/helpers";
import { generatePassword, getErrorMessage } from "@/utils/helpers";
import { Form } from "@/components/forms";
import { StepperFormHeading } from "@/components";

// Sub-components and Hooks
import { useUserPrivileges } from "./hooks/useUserPrivileges";
import { UserForm } from "./components/UserForm";
import { UserPrivilegesSection } from "./components/UserPrivilegesSection";
import { UserActions } from "./components/UserActions";

const UpsertUserPage = () => {
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

  const {
    privileges,
    setPrivileges,
    isFeatureEnabled,
    handleFeatureToggle,
    handlePrivilegeChange,
    handleReportToggle,
    handleReportFilterToggle,
  } = useUserPrivileges();

  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: updateUser } = useUpdateUser();
  const { data: foundUser, isLoading } = useGetUserById({
    id: userId ? Number(userId) : 0,
  });

  // Fetch global data
  const { data: globalData } = useGlobalData();
  const branches = globalData.branches || [];
  const userRoles = globalData.userRoles || [];

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
    formState: { isSubmitting },
  } = form;

  const selectedUserRoleId = watch("userRoleId") || 0;

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  // Reset privileges when role changes
  useEffect(() => {
    setPrivileges({});
  }, [selectedUserRoleId, setPrivileges]);

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
  }, [foundUser, isEditMode, reset, setPrivileges]);

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
    branches.map((branch: GlobalDataGeneral) => ({
      label: branch.nameEn,
      value: Number(branch.id),
    })) || [];

  const userRoleOptions =
    userRoles.map((role: GlobalDataGeneral) => ({
      label: role.nameEn,
      value: Number(role.id),
    })) || [];

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6 font-primary">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading title={isAddMode ? "Add User" : "Edit User"} />
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          </div>
        ) : (
          <>
            <Form
              form={form}
              className="w-full h-full content-start md:max-w-5xl"
            >
              <UserForm
                form={form}
                isEditMode={isEditMode}
                userRoleOptions={userRoleOptions}
                branchOptions={branchOptions}
                onGeneratePassword={handleGeneratePassword}
                selectedUserRoleId={selectedUserRoleId}
              />
              <UserPrivilegesSection
                privileges={privileges}
                isFeatureEnabled={isFeatureEnabled}
                handleFeatureToggle={handleFeatureToggle}
                handlePrivilegeChange={handlePrivilegeChange}
                handleReportToggle={handleReportToggle}
                handleReportFilterToggle={handleReportFilterToggle}
                selectedUserRoleId={selectedUserRoleId}
              />
            </Form>

            <UserActions
              onCancel={() => router.replace("/users")}
              onSave={onFormSubmit}
              isSubmitting={isSubmitting}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UpsertUserPage;
