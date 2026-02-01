"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { classNames } from "primereact/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  useUpdateCity,
  useCreateCity,
  useGetCityById,
} from "@/lib/db/services/city/requests";
import {
  CreateCitySchema,
  UpdateCitySchema,
} from "@/lib/db/services/city/city.schemas";
import { useGetCountries } from "@/lib/db/services/country/requests";
import { ListedCountry } from "@/lib/db/services/country/country.dto";
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
  Checkbox,
} from "@/components/forms";
import { StepperFormHeading } from "@/components";

const UpsertCityPage = () => {
  const router = useRouter();
  const { id: cityIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: cityId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: cityIdParam,
  });

  const { mutateAsync: createCity } = useCreateCity();
  const { mutateAsync: updateCity } = useUpdateCity();
  const { data: foundCity, isLoading } = useGetCityById({
    id: cityId ? Number(cityId) : 0,
  });

  // Fetch countries for dropdown
  const { data: countriesData, isLoading: isLoadingCountries } =
    useGetCountries({
      page: 1,
      limit: 1000, // Get all countries
    });

  const defaultValues = {
    ...(isEditMode ? { id: 0 } : {}),
    nameEn: "",
    nameAr: "",
    countryId: undefined,
    isActive: true,
  };

  const zodSchema = isEditMode ? UpdateCitySchema : CreateCitySchema;

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
    if (foundCity) {
      const setCity = {
        ...(isEditMode ? { id: foundCity?.id ?? 0 } : {}),
        nameEn: foundCity?.nameEn,
        nameAr: foundCity?.nameAr,
        countryId: foundCity?.countryId ?? undefined,
        isActive: foundCity?.isActive,
      };
      reset(setCity);
    }
  }, [foundCity, isEditMode, reset]);

  const onFormSubmit = handleSubmit(async (data) => {
    if (isAddMode) {
      await handleAddCity(data);
    } else {
      await handleUpdateCity(data);
    }
  });

  const handleAddCity = async (data: Record<string, any>) => {
    try {
      console.log("Form submitted: Add City", data);
      await createCity(data, {
        onSuccess: () => {
          toastService.showSuccess("Success", "City created successfully");
          reset(defaultValues);
          router.replace("/setup/cities");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(error, "Failed to create city");
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {}
  };

  const handleUpdateCity = async (data: Record<string, any>) => {
    console.log("Form submitted: Update City", data);
    try {
      await updateCity(data, {
        onSuccess: () => {
          toastService.showSuccess("Success", "City updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(error, "Failed to update city");
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {}
  };

  // Convert countries to dropdown options
  const countryOptions = useMemo(() => {
    return (
      countriesData?.countries?.map((country: ListedCountry) => ({
        label: country.nameEn,
        value: country.id,
      })) || []
    );
  }, [countriesData]);

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading title={isAddMode ? "Add City" : "Edit City"} />
        {isLoading || isLoadingCountries ? (
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
                  <FormItem name="countryId">
                    <Dropdown
                      label="Country"
                      className="w-full"
                      placeholder="Choose Country"
                      options={countryOptions}
                      filter
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
                onClick={() => router.replace("/setup/cities")}
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

export default UpsertCityPage;
