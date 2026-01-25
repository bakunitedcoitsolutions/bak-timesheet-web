"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { classNames } from "primereact/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  useUpdateDesignation,
  useCreateDesignation,
  useGetDesignationById,
} from "@/lib/db/services/designation/requests";
import {
  CreateDesignationSchema,
  UpdateDesignationSchema,
} from "@/lib/db/services/designation/designation.schemas";
import { toastService } from "@/lib/toast";
import { getEntityModeFromParam } from "@/helpers";
import { getErrorMessage } from "@/utils/helpers";
import { FORM_FIELD_WIDTHS, STATUS_OPTIONS } from "@/utils/constants";
import {
  Input,
  Button,
  Dropdown,
  Form,
  FormItem,
  NumberInput,
} from "@/components/forms";
import { StepperFormHeading } from "@/components";

const UpsertDesignationPage = () => {
  const router = useRouter();
  const { id: designationIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: designationId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: designationIdParam,
  });

  const { mutateAsync: createDesignation } = useCreateDesignation();
  const { mutateAsync: updateDesignation } = useUpdateDesignation();
  const { data: foundDesignation, isLoading } = useGetDesignationById({
    id: designationId ? Number(designationId) : 0,
  });

  const defaultValues = {
    ...(isEditMode ? { id: 0 } : {}),
    nameEn: "",
    nameAr: "",
    hoursPerDay: undefined,
    displayOrderKey: undefined,
    color: "#FFFFFF", // Default to white
    breakfastAllowance: undefined,
    isActive: true,
  };

  const zodSchema = isEditMode
    ? UpdateDesignationSchema
    : CreateDesignationSchema;

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
    if (foundDesignation) {
      const setDesignation = {
        ...(isEditMode ? { id: foundDesignation?.id ?? 0 } : {}),
        nameEn: foundDesignation?.nameEn,
        nameAr: foundDesignation?.nameAr,
        hoursPerDay: foundDesignation?.hoursPerDay ?? undefined,
        displayOrderKey: foundDesignation?.displayOrderKey ?? undefined,
        color: foundDesignation?.color || "#FFFFFF",
        breakfastAllowance: foundDesignation?.breakfastAllowance
          ? Number(foundDesignation.breakfastAllowance)
          : undefined,
        isActive: foundDesignation?.isActive,
      };
      reset(setDesignation);
    }
  }, [foundDesignation, isEditMode, reset]);

  const onFormSubmit = handleSubmit(async (data) => {
    if (isAddMode) {
      await handleAddDesignation(data);
    } else {
      await handleUpdateDesignation(data);
    }
  });

  const handleAddDesignation = async (data: Record<string, any>) => {
    try {
      console.log("Form submitted: Add Designation", data);
      await createDesignation(data, {
        onSuccess: () => {
          toastService.showSuccess(
            "Success",
            "Designation created successfully"
          );
          reset(defaultValues);
          router.replace("/setup/designation");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(
            error,
            "Failed to create designation"
          );
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {}
  };

  const handleUpdateDesignation = async (data: Record<string, any>) => {
    console.log("Form submitted: Update Designation", data);
    try {
      await updateDesignation(data, {
        onSuccess: () => {
          toastService.showSuccess(
            "Success",
            "Designation updated successfully"
          );
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(
            error,
            "Failed to update designation"
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
          title={isAddMode ? "Add Designation" : "Edit Designation"}
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
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                  <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                    <FormItem name="hoursPerDay">
                      <NumberInput
                        useGrouping={false}
                        className="w-full"
                        label="Hours per day"
                        placeholder="Enter hours per day"
                      />
                    </FormItem>
                  </div>
                  <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                    <FormItem name="displayOrderKey">
                      <NumberInput
                        useGrouping={false}
                        className="w-full"
                        label="Display Order"
                        placeholder="Enter display order"
                      />
                    </FormItem>
                  </div>
                  <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                    <FormItem name="color">
                      <Input
                        type="color"
                        label="Color"
                        className="w-full h-10.5! p-1! cursor-pointer!"
                        placeholder="Enter color"
                      />
                    </FormItem>
                  </div>
                </div>
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="breakfastAllowance">
                    <NumberInput
                      useGrouping={false}
                      className="w-full"
                      label="Breakfast Allowance"
                      placeholder="Enter breakfast allowance"
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
              </div>
            </Form>

            <div className="flex items-center gap-3 justify-end px-6">
              <Button
                size="small"
                variant="text"
                disabled={isSubmitting}
                onClick={() => router.replace("/setup/designation")}
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

export default UpsertDesignationPage;
