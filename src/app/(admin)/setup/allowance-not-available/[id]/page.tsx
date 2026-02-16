"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { classNames } from "primereact/utils";
import { Calendar } from "primereact/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  Form,
  Input,
  Button,
  Dropdown,
  FormItem,
  Textarea,
} from "@/components/forms";
import { StepperFormHeading } from "@/components";
import { toastService } from "@/lib/toast";
import { getErrorMessage } from "@/utils/helpers";
import { getEntityModeFromParam } from "@/helpers";
import { FORM_FIELD_WIDTHS, STATUS_OPTIONS } from "@/utils/constants";
import {
  useCreateAllowanceNotAvailable,
  useUpdateAllowanceNotAvailable,
  useGetAllowanceNotAvailableById,
} from "@/lib/db/services/allowance-not-available/requests";
import {
  CreateAllowanceNotAvailableSchema,
  UpdateAllowanceNotAvailableSchema,
} from "@/lib/db/services/allowance-not-available/allowance-not-available.schemas";

const ALLOWANCE_TYPES = [
  { label: "Breakfast", value: "BREAKFAST" },
  { label: "Food", value: "FOOD" },
  { label: "Mobile", value: "MOBILE" },
  { label: "Other", value: "OTHER" },
];

const UpsertAllowanceNotAvailablePage = () => {
  const router = useRouter();
  const { id: paramId } = useParams();
  const { isInvalid, isAddMode, isEditMode, entityId } = getEntityModeFromParam(
    {
      addKeyword: "new",
      param: paramId,
    }
  );

  const { mutateAsync: createFn } = useCreateAllowanceNotAvailable();
  const { mutateAsync: updateFn } = useUpdateAllowanceNotAvailable();
  const { data: foundEntity, isLoading } = useGetAllowanceNotAvailableById({
    id: entityId ? Number(entityId as unknown as string) : 0,
  });

  const defaultValues = {
    ...(isEditMode ? { id: 0 } : {}),
    nameEn: "",
    nameAr: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    type: "BREAKFAST" as const,
    isActive: true,
  };

  const zodSchema = isEditMode
    ? UpdateAllowanceNotAvailableSchema
    : CreateAllowanceNotAvailableSchema;

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  useEffect(() => {
    if (foundEntity) {
      const setEntity = {
        ...(isEditMode ? { id: foundEntity?.id ?? 0 } : {}),
        nameEn: foundEntity?.nameEn,
        nameAr: foundEntity?.nameAr ?? "",
        description: foundEntity?.description ?? "",
        startDate: new Date(foundEntity.startDate),
        endDate: new Date(foundEntity.endDate),
        type: foundEntity.type as any,
        isActive: foundEntity?.isActive,
      };
      reset(setEntity);
    }
  }, [foundEntity, isEditMode, reset]);

  const onFormSubmit = handleSubmit(async (data) => {
    if (isAddMode) {
      await handleAdd(data);
    } else {
      await handleUpdate(data);
    }
  });

  const handleAdd = async (data: Record<string, any>) => {
    try {
      await createFn(data, {
        onSuccess: () => {
          toastService.showSuccess("Success", "Record created successfully");
          reset(defaultValues);
          router.replace("/setup/allowance-not-available");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(
            error,
            "Failed to create record"
          );
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {}
  };

  const handleUpdate = async (data: Record<string, any>) => {
    try {
      await updateFn(data, {
        onSuccess: () => {
          toastService.showSuccess("Success", "Record updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(
            error,
            "Failed to update record"
          );
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {}
  };

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading
          title={
            isAddMode
              ? "Add Allowance Not Available"
              : "Edit Allowance Not Available"
          }
        />
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
                  <FormItem name="startDate">
                    <Calendar
                      placeholder="Start Date"
                      className="w-full"
                      // showIcon
                    />
                  </FormItem>
                </div>
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="endDate">
                    <Calendar
                      placeholder="End Date"
                      className="w-full"
                      // showIcon
                    />
                  </FormItem>
                </div>

                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="type">
                    <Dropdown
                      label="Allowance Type"
                      className="w-full"
                      placeholder="Choose Type"
                      options={ALLOWANCE_TYPES}
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

                <div
                  className={classNames(FORM_FIELD_WIDTHS["2"], "col-span-2")}
                >
                  <FormItem name="description">
                    <Textarea
                      label="Description"
                      className="w-full"
                      placeholder="Enter description"
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
                onClick={() => router.replace("/setup/allowance-not-available")}
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

export default UpsertAllowanceNotAvailablePage;
