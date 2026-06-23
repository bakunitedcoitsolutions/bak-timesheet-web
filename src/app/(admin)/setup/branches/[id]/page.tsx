"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { classNames } from "primereact/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  useGetBranches,
  useUpdateBranch,
  useCreateBranch,
  useGetBranchById,
} from "@/lib/db/services/branch/requests";
import {
  CreateBranchSchema,
  UpdateBranchSchema,
} from "@/lib/db/services/branch/branch.schemas";
import {
  Form,
  Input,
  Button,
  Dropdown,
  FormItem,
  RadioGroup,
} from "@/components/forms";
import { toastService } from "@/lib/toast";
import { StepperFormHeading } from "@/components";
import { getErrorMessage } from "@/utils/helpers";
import { getEntityModeFromParam } from "@/helpers";
import { FORM_FIELD_WIDTHS, STATUS_OPTIONS } from "@/utils/constants";

const UpsertBranchPage = () => {
  const router = useRouter();
  const { id: branchIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: branchId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: branchIdParam,
  });

  const { mutateAsync: createBranch } = useCreateBranch();
  const { mutateAsync: updateBranch } = useUpdateBranch();
  const { data: foundBranch, isLoading } = useGetBranchById({
    id: branchId ? Number(branchId) : 0,
  });

  const { data: mainBranchesResponse } = useGetBranches({
    limit: 1000,
    isMain: true,
  });
  const mainBranches = mainBranchesResponse?.branches || [];

  const defaultValues = {
    ...(isEditMode ? { id: 0 } : {}),
    nameEn: "",
    nameAr: "",
    isMain: true,
    parentBranchId: null,
    isActive: true,
  };

  const zodSchema = isEditMode ? UpdateBranchSchema : CreateBranchSchema;

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = form;

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  useEffect(() => {
    if (foundBranch) {
      const setBranch = {
        ...(isEditMode ? { id: foundBranch?.id ?? 0 } : {}),
        nameEn: foundBranch?.nameEn,
        nameAr: foundBranch?.nameAr,
        isMain: foundBranch?.isMain ?? true,
        parentBranchId: foundBranch?.parentBranchId ?? null,
        isActive: foundBranch?.isActive,
      };
      reset(setBranch);
    }
  }, [foundBranch, isEditMode, reset]);

  const watchedIsMain = form.watch("isMain");
  useEffect(() => {
    if (watchedIsMain === true) {
      form.setValue("parentBranchId", null);
    }
  }, [watchedIsMain, form]);

  const onFormSubmit = handleSubmit(async (data) => {
    if (isAddMode) {
      await handleAddBranch(data);
    } else {
      await handleUpdateBranch(data);
    }
  });

  const handleAddBranch = async (data: Record<string, any>) => {
    try {
      await createBranch(data, {
        onSuccess: () => {
          toastService.showSuccess("Success", "Branch created successfully");
          reset(defaultValues);
          router.replace("/setup/branches");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(
            error,
            "Failed to create branch"
          );
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {}
  };

  const handleUpdateBranch = async (data: Record<string, any>) => {
    try {
      await updateBranch(data, {
        onSuccess: () => {
          toastService.showSuccess("Success", "Branch updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(
            error,
            "Failed to update branch"
          );
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {}
  };

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading title={isAddMode ? "Add Branch" : "Edit Branch"} />
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
                  <FormItem name="isMain">
                    <RadioGroup
                      label="Branch Type"
                      options={[
                        { label: "Main Branch", value: true },
                        { label: "Sub Branch", value: false },
                      ]}
                    />
                  </FormItem>
                </div>
                {watchedIsMain === false && (
                  <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                    <FormItem name="parentBranchId">
                      <Dropdown
                        filter
                        label="Parent Branch"
                        className="w-full"
                        placeholder="Choose parent branch"
                        options={mainBranches
                          ?.filter((b: any) => b.id !== Number(branchId))
                          ?.map((b: any) => ({
                            label: b.nameEn,
                            value: b.id,
                          }))}
                      />
                    </FormItem>
                  </div>
                )}
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
              </div>
            </Form>

            <div className="flex items-center gap-3 justify-end px-6">
              <Button
                size="small"
                variant="text"
                disabled={isSubmitting}
                onClick={() => router.replace("/setup/branches")}
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

export default UpsertBranchPage;
