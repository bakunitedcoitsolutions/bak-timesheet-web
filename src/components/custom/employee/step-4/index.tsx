"use client";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classNames } from "primereact/utils";
import { ProgressSpinner } from "primereact/progressspinner";

import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { StepperFormHeading } from "@/components/common";
import {
  Dropdown,
  Form,
  FormItem,
  Input,
  NumberInput,
} from "@/components/forms";
import { getErrorMessage } from "@/utils/helpers";
import { toastService } from "@/lib/toast";
import {
  useUpdateEmployeeStep4,
  useGetEmployeeById,
} from "@/lib/db/services/employee";
import { UpdateEmployeeStep4Schema } from "@/lib/db/services/employee/employee.schemas";
import { useStepperForm } from "@/context";
import { useGetGosiCities } from "@/lib/db/services/gosi-city";
import type { ListedGosiCity } from "@/lib/db/services/gosi-city/gosi-city.dto";

interface Step4Props {
  employeeId?: number | null;
}

export interface Step4Handle {
  submit: () => Promise<boolean>;
}

const Step4 = forwardRef<Step4Handle, Step4Props>(({ employeeId }, ref) => {
  const { setIsSubmitting } = useStepperForm();

  const { mutateAsync: updateEmployee } = useUpdateEmployeeStep4();
  const {
    data: foundEmployee,
    isLoading: isLoadingEmployee,
    refetch: refetchEmployee,
  } = useGetEmployeeById({
    id: employeeId ?? 0,
  });

  // Fetch dropdown data
  const { data: gosiCitiesData } = useGetGosiCities({ page: 1, limit: 1000 });

  const defaultValues = {
    id: employeeId ?? 0,
    bankName: "",
    bankCode: "",
    iban: "",
    gosiSalary: undefined,
    gosiCityId: undefined,
  };

  const form = useForm({
    resolver: zodResolver(UpdateEmployeeStep4Schema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { errors },
  } = form;

  // Load employee data when in edit mode
  useEffect(() => {
    if (foundEmployee && employeeId) {
      const setEmployee = {
        id: foundEmployee.id,
        bankName: foundEmployee.bankName || "",
        bankCode: foundEmployee.bankCode || "",
        iban: foundEmployee.iban || "",
        gosiSalary: foundEmployee.gosiSalary
          ? Number(foundEmployee.gosiSalary)
          : undefined,
        gosiCityId: foundEmployee.gosiCityId || undefined,
      };
      reset(setEmployee);
    }
  }, [foundEmployee, employeeId, reset]);

  const handleFormSubmit = async (data: any): Promise<boolean> => {
    if (!employeeId) {
      toastService.showError("Error", "Employee ID is required");
      return false;
    }

    setIsSubmitting(true);
    try {
      // Prepare submit data
      const submitData = {
        ...data,
        bankName: data.bankName || undefined,
        bankCode: data.bankCode || undefined,
        iban: data.iban || undefined,
        gosiSalary: data.gosiSalary || undefined,
        gosiCityId: data.gosiCityId || undefined,
      };

      await updateEmployee(submitData);
      toastService.showSuccess("Success", "Employee updated successfully");

      return true;
    } catch (error: any) {
      console.error("Error:", error);
      toastService.showError(
        "Error",
        getErrorMessage(error) || "Failed to save employee"
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormSubmit = handleSubmit(handleFormSubmit);

  // Expose submit method via ref
  useImperativeHandle(ref, () => ({
    submit: async () => {
      return new Promise<boolean>((resolve) => {
        handleSubmit(async (data) => {
          const result = await handleFormSubmit(data);
          resolve(result);
        })();
      });
    },
  }));

  // Prepare dropdown options
  const bankOptions = [
    { label: "Saudi National Bank", value: "Saudi National Bank" },
    { label: "Al Rajhi Bank", value: "Al Rajhi Bank" },
    { label: "Alinma Bank", value: "Alinma Bank" },
    { label: "Saudi British Bank", value: "Saudi British Bank" },
    { label: "Other", value: "Other" },
  ];

  const gosiCityOptions =
    gosiCitiesData?.gosiCities.map((city: ListedGosiCity) => ({
      label: city.nameEn,
      value: city.id,
    })) || [];

  if (isLoadingEmployee) {
    return (
      <div className="flex items-center justify-center h-full">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <Form form={form} onSubmit={onFormSubmit}>
      <div className="flex flex-1 md:flex-none flex-col gap-10 py-6">
        <div className="flex flex-col gap-4">
          <StepperFormHeading title="Bank Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
            <FormItem name="bankName" className={classNames(FORM_FIELD_WIDTHS["2"])}>
              <Dropdown
                label="Name"
                className="w-full"
                options={bankOptions}
                placeholder="Choose Bank"
              />
            </FormItem>
            <FormItem name="bankCode" className={classNames(FORM_FIELD_WIDTHS["2"])}>
              <Input
                className="w-full"
                label="Code"
                placeholder="Enter bank code"
              />
            </FormItem>
            <FormItem
              name="iban"
              className={classNames(FORM_FIELD_WIDTHS["2"], "md:col-span-2")}
            >
              <Input label="IBAN" className="w-full" placeholder="Enter IBAN" />
            </FormItem>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <StepperFormHeading title="GOSI Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
            <FormItem
              name="gosiSalary"
              className={classNames(FORM_FIELD_WIDTHS["2"])}
            >
              <NumberInput
                label="Salary"
                className="w-full"
                useGrouping={false}
                placeholder="Enter GOSI salary"
              />
            </FormItem>
            <FormItem
              name="gosiCityId"
              className={classNames(FORM_FIELD_WIDTHS["2"])}
            >
              <Dropdown
                label="City"
                className="w-full"
                options={gosiCityOptions}
                placeholder="GOSI City"
              />
            </FormItem>
          </div>
        </div>
      </div>
    </Form>
  );
});

Step4.displayName = "Step4";

export default Step4;
