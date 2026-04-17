"use client";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { STORAGE_CONFIG } from "@/utils/constants";
import { toastService } from "@/lib/toast";
import { getErrorMessage, FILE_TYPES } from "@/utils/helpers";
import {
  useGetEmployeeById,
  useUpdateEmployeeStep2,
} from "@/lib/db/services/employee";
import { useAccess } from "@/components";
import { UpdateEmployeeStep2Schema } from "@/lib/db/services/employee/employee.schemas";
import {
  useGlobalData,
  GlobalDataCity,
  GlobalDataGeneral,
  GlobalDataDesignation,
} from "@/context/GlobalDataContext";
import { useFileUpload } from "@/hooks";
import { useStepperForm } from "@/context";
import { devConsole, devError } from "@/utils/helpers/functions";

interface UseStep2LogicProps {
  employeeId?: number | null;
}

export const useStep2Logic = ({ employeeId }: UseStep2LogicProps) => {
  const { setIsSubmitting } = useStepperForm();
  const { isBranchScoped, branchId: userBranchId } = useAccess();

  const { mutateAsync: updateEmployee } = useUpdateEmployeeStep2();
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
    gender: undefined,
    countryId: undefined,
    cityId: undefined,
    statusId: undefined,
    branchId: undefined,
    designationId: 0,
    payrollSectionId: 0,
    isDeductable: false,
    isFixed: false,
    workingDays: undefined,
    hourlyRate: undefined,
    salary: undefined,
    breakfastAllowance: false,
    foodAllowance: undefined,
    mobileAllowance: undefined,
    otherAllowance: undefined,
    contractStartDate: "",
    contractEndDate: "",
    contractDocument: "",
    contractEndReason: "",
    joiningDate: "",
  };

  const form = useForm({
    resolver: zodResolver(UpdateEmployeeStep2Schema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const isFixed = watch("isFixed");
  const contractStartDate = watch("contractStartDate");
  const contractEndDate = watch("contractEndDate");
  const selectedCountryId = watch("countryId");
  const currentCityId = watch("cityId");

  // File upload hook for contract document
  const contractDocUpload = useFileUpload({
    existingFilePath: foundEmployee?.contractDocument || null,
    bucket: STORAGE_CONFIG.EMPLOYEES_BUCKET,
    folder: "documents/contracts",
    acceptedTypes: [...FILE_TYPES.IMAGES, "application/pdf"],
    maxSizeMB: 10,
    isPublic: false,
    onUploadSuccess: (filePath) => {
      setValue("contractDocument", filePath);
    },
  });

  // Load employee data when in edit mode
  useEffect(() => {
    if (foundEmployee && employeeId) {
      const setEmployee = {
        id: foundEmployee.id,
        gender: foundEmployee.gender || undefined,
        countryId: foundEmployee.countryId || undefined,
        cityId: foundEmployee.cityId || undefined,
        statusId: foundEmployee.statusId || undefined,
        branchId: foundEmployee?.branchId || undefined,
        designationId: foundEmployee.designationId ?? 0,
        payrollSectionId: foundEmployee.payrollSectionId ?? 0,
        isDeductable: foundEmployee.isDeductable ?? false,
        isFixed: foundEmployee.isFixed ?? false,
        workingDays: foundEmployee.workingDays || undefined,
        hourlyRate: foundEmployee.hourlyRate
          ? Number(foundEmployee.hourlyRate)
          : undefined,
        salary: foundEmployee.salary ? Number(foundEmployee.salary) : undefined,
        breakfastAllowance: foundEmployee.breakfastAllowance ?? false,
        foodAllowance: foundEmployee.foodAllowance
          ? Number(foundEmployee.foodAllowance)
          : undefined,
        mobileAllowance: foundEmployee.mobileAllowance
          ? Number(foundEmployee.mobileAllowance)
          : undefined,
        otherAllowance: foundEmployee.otherAllowance
          ? Number(foundEmployee.otherAllowance)
          : undefined,
        contractStartDate: foundEmployee.contractStartDate
          ? new Date(foundEmployee.contractStartDate)
              .toISOString()
              .split("T")[0]
          : "",
        contractEndDate: foundEmployee.contractEndDate
          ? new Date(foundEmployee.contractEndDate).toISOString().split("T")[0]
          : "",
        contractDocument: foundEmployee.contractDocument || "",
        contractEndReason: foundEmployee.contractEndReason || "",
        joiningDate: foundEmployee.joiningDate
          ? new Date(foundEmployee.joiningDate).toISOString().split("T")[0]
          : "",
      };
      reset(setEmployee);
    }
  }, [foundEmployee, employeeId, reset]);

  // Handle branch auto-fill for branch-scoped users
  useEffect(() => {
    if (isBranchScoped && userBranchId && !foundEmployee?.branchId) {
      setValue("branchId", userBranchId);
    }
  }, [isBranchScoped, userBranchId, foundEmployee]);

  // Handle isFixed change - set opposite field to 0
  useEffect(() => {
    if (isFixed === true) {
      setValue("hourlyRate", 0);
    } else if (isFixed === false) {
      setValue("salary", 0);
    }
  }, [isFixed, setValue]);

  // Clear city selection when country changes
  useEffect(() => {
    if (selectedCountryId && currentCityId) {
      const selectedCity = globalData.cities?.find?.(
        (city: GlobalDataCity) => city.id === currentCityId
      );
      if (selectedCity && selectedCity.countryId !== selectedCountryId) {
        setValue("cityId", undefined);
      }
    } else if (!selectedCountryId) {
      setValue("cityId", undefined);
    }
  }, [selectedCountryId, globalData.cities, currentCityId, setValue]);

  const handleSalaryBlur = () => {
    const currentSalary = form.getValues("salary");
    const currentWorkingDays = form.getValues("workingDays");
    const currentDesignationId = form.getValues("designationId");

    if (currentSalary) {
      const daysToUse =
        currentWorkingDays && currentWorkingDays > 0 ? currentWorkingDays : 30;
      const selectedDesignation = globalData.designations.find(
        (d: GlobalDataDesignation) => d.id === currentDesignationId
      );
      const hoursToUse = selectedDesignation?.hoursPerDay || 8;
      const calculatedHourlyRate = currentSalary / daysToUse / hoursToUse;
      setValue("hourlyRate", Number(calculatedHourlyRate.toFixed(2)));
    }
  };

  const handleFormSubmit = async (data: any): Promise<boolean> => {
    if (!employeeId) {
      toastService.showError("Error", "Employee ID is required");
      return false;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        contractDocument: contractDocUpload.shouldDelete
          ? ""
          : contractDocUpload.selectedFile
            ? ""
            : data.contractDocument || "",
        contractStartDate: data.contractStartDate || undefined,
        contractEndDate: data.contractEndDate || undefined,
        joiningDate: data.joiningDate || undefined,
      };
      console.log("submitData ==> ", submitData);
      await updateEmployee(submitData);
      toastService.showSuccess("Success", "Employee updated successfully");

      if (
        contractDocUpload.selectedFile &&
        employeeId &&
        !contractDocUpload.shouldDelete
      ) {
        try {
          await contractDocUpload.uploadFileAfterSave(
            employeeId,
            async (updateData: any) => {
              await updateEmployee(updateData);
            },
            {
              designationId: data.designationId,
              payrollSectionId: data.payrollSectionId,
              gender: data.gender,
              countryId: data.countryId,
              cityId: data.cityId,
              statusId: data.statusId,
              branchId: data.branchId,
              isDeductable: data.isDeductable,
              isFixed: data.isFixed,
              workingDays: data.workingDays,
              hourlyRate: data.hourlyRate,
              salary: data.salary,
              breakfastAllowance: data.breakfastAllowance,
              foodAllowance: data.foodAllowance,
              mobileAllowance: data.mobileAllowance,
              otherAllowance: data.otherAllowance,
              contractStartDate: data.contractStartDate,
              contractEndDate: data.contractEndDate,
              contractEndReason: data.contractEndReason,
              joiningDate: data.joiningDate,
            },
            "contractDocument"
          );
        } catch (error: any) {
          devConsole("Failed to upload contract document:", error);
        }
      }

      if (contractDocUpload.shouldDelete) {
        contractDocUpload.clearDeletion();
        await refetchEmployee();
      }

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

  // Dropdown options
  const options = useMemo(() => {
    return {
      gender: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ],
      countries: globalData.countries.map((country: GlobalDataGeneral) => ({
        label: country.nameEn,
        value: country.id,
      })),
      cities: globalData.cities
        .filter((city: GlobalDataCity) => {
          if (!selectedCountryId) return true;
          return city.countryId === selectedCountryId;
        })
        .map((city: GlobalDataCity) => ({
          label: city.nameEn,
          value: city.id,
        })),
      branches: globalData.branches.map((branch: GlobalDataGeneral) => ({
        label: branch.nameEn,
        value: branch.id,
        isMain: branch.isMain,
      })),
      designations: globalData.designations.map(
        (designation: GlobalDataDesignation) => ({
          label: designation.nameEn,
          value: designation.id,
        })
      ),
      payrollSections: globalData.payrollSections.map(
        (section: GlobalDataGeneral) => ({
          label: section.nameEn,
          value: section.id,
        })
      ),
      employeeStatuses: globalData.employeeStatuses.map(
        (status: GlobalDataGeneral) => ({
          label: status.nameEn,
          value: status.id,
        })
      ),
      isFixed: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
      isDeductable: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    };
  }, [globalData, selectedCountryId]);

  const remainingDays = useMemo(() => {
    if (!contractStartDate || !contractEndDate) return "N/A";
    try {
      const endDate = new Date(contractEndDate);
      const today = new Date();
      endDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays < 0 ? "Expired" : diffDays.toString();
    } catch {
      return "N/A";
    }
  }, [contractStartDate, contractEndDate]);

  const contractDocPickerValue = useMemo(() => {
    const existingContractDoc = contractDocUpload.getExistingFileObject();
    return contractDocUpload.selectedFile
      ? [contractDocUpload.selectedFile]
      : existingContractDoc
        ? [existingContractDoc]
        : [];
  }, [
    contractDocUpload.selectedFile,
    contractDocUpload.getExistingFileObject(),
  ]);

  return {
    form,
    errors,
    options,
    isFixed,
    isBranchScoped,
    isLoadingEmployee,
    remainingDays,
    contractDocUpload,
    contractDocPickerValue,
    handleSalaryBlur,
    handleFormSubmit,
    onFormSubmit,
    handleSubmit,
  };
};
