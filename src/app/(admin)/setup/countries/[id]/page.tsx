"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { classNames } from "primereact/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  useUpdateCountry,
  useCreateCountry,
  useGetCountryById,
} from "@/lib/db/services/country/requests";
import {
  CreateCountrySchema,
  UpdateCountrySchema,
} from "@/lib/db/services/country/country.schemas";
import { toastService } from "@/lib/toast";
import { getEntityModeFromParam } from "@/helpers";
import { getErrorMessage } from "@/utils/helpers";
import { FORM_FIELD_WIDTHS, STATUS_OPTIONS } from "@/utils/constants";
import { Input, Button, Dropdown, Form, FormItem } from "@/components/forms";
import { StepperFormHeading } from "@/components";

const UpsertCountryPage = () => {
  const router = useRouter();
  const { id: countryIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: countryId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: countryIdParam,
  });

  const { mutateAsync: createCountry } = useCreateCountry();
  const { mutateAsync: updateCountry } = useUpdateCountry();
  const { data: foundCountry, isLoading } = useGetCountryById({
    id: countryId ? Number(countryId) : 0,
  });

  const defaultValues = {
    ...(isEditMode ? { id: 0 } : {}),
    nameEn: "",
    nameAr: "",
    isActive: true,
  };

  const zodSchema = isEditMode ? UpdateCountrySchema : CreateCountrySchema;

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
    if (foundCountry) {
      const setCountry = {
        ...(isEditMode ? { id: foundCountry?.id ?? 0 } : {}),
        nameEn: foundCountry?.nameEn,
        nameAr: foundCountry?.nameAr,
        isActive: foundCountry?.isActive,
      };
      reset(setCountry);
    }
  }, [foundCountry, isEditMode, reset]);

  const onFormSubmit = handleSubmit(async (data) => {
    if (isAddMode) {
      await handleAddCountry(data);
    } else {
      await handleUpdateCountry(data);
    }
  });

  const handleAddCountry = async (data: Record<string, any>) => {
    try {
      console.log("Form submitted: Add Country", data);
      await createCountry(data, {
        onSuccess: () => {
          toastService.showSuccess("Success", "Country created successfully");
          reset(defaultValues);
          router.replace("/setup/countries");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(
            error,
            "Failed to create country"
          );
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {}
  };

  const handleUpdateCountry = async (data: Record<string, any>) => {
    console.log("Form submitted: Update Country", data);
    try {
      await updateCountry(data, {
        onSuccess: () => {
          toastService.showSuccess("Success", "Country updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(
            error,
            "Failed to update country"
          );
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {}
  };

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading title={isAddMode ? "Add Country" : "Edit Country"} />
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
                onClick={() => router.replace("/setup/countries")}
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

export default UpsertCountryPage;
