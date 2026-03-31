"use client";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toastService } from "@/lib/toast";
import { getErrorMessage } from "@/utils/helpers";
import {
  useUpdateEmployeeStep4,
  useGetEmployeeById,
} from "@/lib/db/services/employee";
import { UpdateEmployeeStep4Schema } from "@/lib/db/services/employee/employee.schemas";
import { useStepperForm } from "@/context";
import { GlobalDataGeneral, useGlobalData } from "@/context/GlobalDataContext";
import { devError } from "@/utils/helpers/functions";

interface UseStep4LogicProps {
  employeeId?: number | null;
}

export const useStep4Logic = ({ employeeId }: UseStep4LogicProps) => {
  const { setIsSubmitting } = useStepperForm();

  const { mutateAsync: updateEmployee } = useUpdateEmployeeStep4();
  const {
    data: foundEmployee,
    isLoading: isLoadingEmployee,
    refetch: refetchEmployee,
  } = useGetEmployeeById({
    id: employeeId ?? 0,
  });

  const { data: globalData } = useGlobalData();

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
      devError("Error:", error);
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

  const bankOptions = [
    { label: "Saudi National Bank", value: "Saudi National Bank" },
    { label: "Al Rajhi Bank", value: "Al Rajhi Bank" },
    { label: "Alinma Bank", value: "Alinma Bank" },
    { label: "Saudi British Bank", value: "Saudi British Bank" },
    { label: "Other", value: "Other" },
  ];

  const gosiCityOptions = useMemo(() => {
    return globalData.gosiCities.map((city: GlobalDataGeneral) => ({
      label: city.nameEn,
      value: city.id,
    }));
  }, [globalData.gosiCities]);

  return {
    form,
    errors,
    isLoadingEmployee,
    bankOptions,
    gosiCityOptions,
    handleFormSubmit,
    onFormSubmit,
    handleSubmit,
  };
};
