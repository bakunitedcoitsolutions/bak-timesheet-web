"use client";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { classNames } from "primereact/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProgressSpinner } from "primereact/progressspinner";

import { FORM_FIELD_WIDTHS, STORAGE_CONFIG } from "@/utils/constants";
import {
  Form,
  Input,
  FormItem,
  Dropdown,
  FilePicker,
  NumberInput,
} from "@/components/forms";
import { toastService } from "@/lib/toast";
import { useStepperForm } from "@/context";
import { StepperFormHeading } from "@/components/common";
import { getErrorMessage, FILE_TYPES } from "@/utils/helpers";
import {
  useGetEmployeeById,
  useUpdateEmployeeStep2,
} from "@/lib/db/services/employee";
import { UpdateEmployeeStep2Schema } from "@/lib/db/services/employee/employee.schemas";
import {
  useGlobalData,
  GlobalDataCity,
  GlobalDataGeneral,
  GlobalDataDesignation,
} from "@/context/GlobalDataContext";
import { useFileUpload } from "@/hooks";

interface Step2Props {
  employeeId?: number | null;
}

export interface Step2Handle {
  submit: () => Promise<boolean>;
}

const Step2 = forwardRef<Step2Handle, Step2Props>(({ employeeId }, ref) => {
  const { setIsSubmitting } = useStepperForm();

  const { mutateAsync: updateEmployee } = useUpdateEmployeeStep2();
  const {
    data: foundEmployee,
    isLoading: isLoadingEmployee,
    refetch: refetchEmployee,
  } = useGetEmployeeById({
    id: employeeId ?? 0,
  });

  // Fetch globel data
  const { data: globalData } = useGlobalData();

  const countriesData = { countries: globalData.countries };
  const citiesData = { cities: globalData.cities };
  const branchesData = { branches: globalData.branches };
  const designationsData = { designations: globalData.designations };
  const payrollSectionsData = { payrollSections: globalData.payrollSections };
  const employeeStatusesData = {
    employeeStatuses: globalData.employeeStatuses,
  };

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
        branchId: foundEmployee.branchId || undefined,
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

  // Handle isFixed change - set opposite field to 0
  useEffect(() => {
    if (isFixed === true) {
      setValue("hourlyRate", 0);
    } else if (isFixed === false) {
      setValue("salary", 0);
    }
  }, [isFixed]);

  // Clear city selection when country changes
  const currentCityId = watch("cityId");

  useEffect(() => {
    if (selectedCountryId && currentCityId) {
      // Check if the selected city belongs to the selected country
      const selectedCity = globalData.cities?.find?.(
        (city: GlobalDataCity) => city.id === currentCityId
      );
      if (selectedCity && selectedCity.countryId !== selectedCountryId) {
        // City doesn't belong to selected country, clear it
        setValue("cityId", undefined);
      }
    } else if (!selectedCountryId) {
      // If country is cleared, also clear city
      setValue("cityId", undefined);
    }
  }, [selectedCountryId, globalData.cities, currentCityId]);

  // Calculate Hourly Rate on Salary blur
  const handleSalaryBlur = () => {
    const currentSalary = form.getValues("salary");
    const currentWorkingDays = form.getValues("workingDays");
    const currentDesignationId = form.getValues("designationId");

    if (currentSalary) {
      const daysToUse =
        currentWorkingDays && currentWorkingDays > 0 ? currentWorkingDays : 30;

      // Find hours per day from selected designation
      const selectedDesignation = globalData.designations.find(
        (d: GlobalDataDesignation) => d.id === currentDesignationId
      );
      // Use designation hours or default to 8
      const hoursToUse = selectedDesignation?.hoursPerDay || 8;

      // Formula: Salary / Working Days / Hours Per Day
      const calculatedHourlyRate = currentSalary / daysToUse / hoursToUse;
      // Round to 2 decimal places
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
      // Prepare submit data
      const submitData = {
        ...data,
        contractDocument: contractDocUpload.shouldDelete
          ? ""
          : contractDocUpload.selectedFile
            ? "" // Will upload after save
            : data.contractDocument || "",
        contractStartDate: data.contractStartDate || undefined,
        contractEndDate: data.contractEndDate || undefined,
        joiningDate: data.joiningDate || undefined,
      };

      await updateEmployee(submitData);
      toastService.showSuccess("Success", "Employee updated successfully");

      // Upload contract document if new file selected
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
          console.warn("Failed to upload contract document:", error);
        }
      }

      // Clear delete flag after successful save
      if (contractDocUpload.shouldDelete) {
        contractDocUpload.clearDeletion();
        await refetchEmployee();
      }

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
  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];

  const countryOptions =
    countriesData?.countries.map((country: GlobalDataGeneral) => ({
      label: country.nameEn,
      value: country.id,
    })) || [];

  const cityOptions =
    citiesData?.cities
      .filter((city: GlobalDataCity) => {
        // If no country is selected, show all cities
        if (!selectedCountryId) {
          return true;
        }
        // Filter cities by selected country
        return city.countryId === selectedCountryId;
      })
      .map((city: GlobalDataCity) => ({
        label: city.nameEn,
        value: city.id,
      })) || [];

  const branchOptions =
    branchesData?.branches.map((branch: GlobalDataGeneral) => ({
      label: branch.nameEn,
      value: branch.id,
    })) || [];

  const designationOptions =
    designationsData?.designations.map(
      (designation: GlobalDataDesignation) => ({
        label: designation.nameEn,
        value: designation.id,
      })
    ) || [];

  const payrollSectionOptions =
    payrollSectionsData?.payrollSections.map((section: GlobalDataGeneral) => ({
      label: section.nameEn,
      value: section.id,
    })) || [];

  const employeeStatusOptions =
    employeeStatusesData?.employeeStatuses.map((status: GlobalDataGeneral) => ({
      label: status.nameEn,
      value: status.id,
    })) || [];

  const isFixedOptions = [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  const isDeductableOptions = [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  if (isLoadingEmployee) {
    return (
      <div className="flex items-center justify-center h-full">
        <ProgressSpinner />
      </div>
    );
  }

  const existingContractDoc = contractDocUpload.getExistingFileObject();
  const contractDocPickerValue = contractDocUpload.selectedFile
    ? [contractDocUpload.selectedFile]
    : existingContractDoc
      ? [existingContractDoc]
      : [];

  // Calculate remaining contract days
  const calculateRemainingDays = (): string => {
    if (!contractStartDate || !contractEndDate) {
      return "N/A";
    }

    try {
      const startDate = new Date(contractStartDate);
      const endDate = new Date(contractEndDate);
      const today = new Date();

      // Set time to midnight for accurate day calculation
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      // Calculate difference in days
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return "Expired";
      }

      return diffDays.toString();
    } catch (error) {
      return "N/A";
    }
  };

  const remainingDays = calculateRemainingDays();

  return (
    <Form form={form} onSubmit={onFormSubmit}>
      <div className="flex flex-1 md:flex-none flex-col gap-4 py-6">
        <StepperFormHeading title="Contract Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
          {/* First Row */}
          <FormItem
            name="gender"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <Dropdown
              label="Gender"
              className="w-full"
              options={genderOptions}
              placeholder="Choose"
            />
          </FormItem>
          <FormItem
            name="countryId"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <Dropdown
              label="Country"
              className="w-full"
              options={countryOptions}
              placeholder="Choose"
            />
          </FormItem>
          <FormItem
            name="cityId"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <Dropdown
              label="City"
              className="w-full"
              options={cityOptions}
              placeholder="Choose"
            />
          </FormItem>
          <FormItem
            name="statusId"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <Dropdown
              label="Employee Status"
              className="w-full"
              options={employeeStatusOptions}
              placeholder="Choose"
            />
          </FormItem>

          {/* Mobile Separator */}
          <div className="w-full h-px mt-2 mb-2 bg-primary-light block md:hidden" />

          {/* Second Row */}
          <FormItem
            name="branchId"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <Dropdown
              label="Branch"
              className="w-full"
              options={branchOptions}
              placeholder="Choose"
            />
          </FormItem>
          <FormItem
            name="designationId"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <Dropdown
              label="Designation"
              className="w-full"
              options={designationOptions}
              placeholder="Choose"
            />
          </FormItem>
          <FormItem
            name="payrollSectionId"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <Dropdown
              label="Payroll Section"
              className="w-full"
              options={payrollSectionOptions}
              placeholder="Choose"
            />
          </FormItem>
          <FormItem
            name="isFixed"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <Dropdown
              label="Is Fixed?"
              className="w-full"
              options={isFixedOptions}
              placeholder="Choose"
            />
          </FormItem>
          {/* Mobile Separator */}
          <div className="w-full h-px mt-2 mb-2 bg-primary-light block md:hidden" />

          {/* Third Row */}
          <FormItem
            name="isDeductable"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <Dropdown
              className="w-full"
              placeholder="Choose"
              label="Is Deductable?"
              options={isDeductableOptions}
            />
          </FormItem>
          <FormItem
            name="workingDays"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <NumberInput
              min={0}
              maxLength={2}
              label="Working Days"
              className="w-full"
              useGrouping={false}
              placeholder="Enter working days"
            />
          </FormItem>

          {/* Mobile Separator */}
          <div className="w-full h-px mt-2 mb-2 bg-primary-light block md:hidden" />

          {/* Fourth Row */}
          <FormItem
            name="salary"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <NumberInput
              min={0}
              maxLength={10}
              label="Salary"
              className="w-full"
              useGrouping={false}
              placeholder="Enter salary"
              disabled={isFixed !== true}
              onBlur={handleSalaryBlur}
            />
          </FormItem>
          <FormItem
            name="hourlyRate"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <NumberInput
              min={0}
              maxLength={10}
              label="Hourly Rate"
              className="w-full"
              useGrouping={false}
              placeholder="Enter hourly rate"
            />
          </FormItem>
          <FormItem
            name="breakfastAllowance"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <Dropdown
              label="Breakfast Allowance"
              className="w-full"
              options={isFixedOptions}
              placeholder="Choose"
            />
          </FormItem>
          <FormItem
            name="foodAllowance"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <NumberInput
              min={0}
              maxLength={10}
              label="Food Allowance"
              className="w-full"
              useGrouping={false}
              placeholder="Enter food allowance"
            />
          </FormItem>
          <FormItem
            name="mobileAllowance"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <NumberInput
              min={0}
              maxLength={10}
              label="Mobile Allowance"
              className="w-full"
              useGrouping={false}
              placeholder="Enter mobile allowance"
            />
          </FormItem>
          <FormItem
            name="otherAllowance"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <NumberInput
              min={0}
              maxLength={10}
              label="Other Allowance"
              className="w-full"
              useGrouping={false}
              placeholder="Enter other allowance"
            />
          </FormItem>
          {/* Mobile Separator */}
          <div className="w-full h-px mt-2 mb-2 bg-primary-light block md:hidden" />

          {/* Fifth Row */}
          <FormItem
            name="contractStartDate"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <Input
              type="date"
              label="Contract Start Date"
              className="w-full"
              placeholder="Enter contract start date"
            />
          </FormItem>
          <FormItem
            name="contractEndDate"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <Input
              type="date"
              label="Contract End Date"
              className="w-full"
              placeholder="Enter contract end date"
            />
          </FormItem>
          <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
            <Input
              disabled
              label="Contract Rem. Days"
              className="w-full"
              value={remainingDays}
              placeholder="N/A"
              onChange={() => {}}
            />
          </div>
          <FormItem
            name="joiningDate"
            className={classNames(FORM_FIELD_WIDTHS["4"])}
          >
            <Input
              type="date"
              label="Joining Date"
              className="w-full"
              placeholder="Enter joining date"
            />
          </FormItem>
          <FormItem
            name="contractEndReason"
            className={classNames(FORM_FIELD_WIDTHS["4"], "xl:col-span-2")}
          >
            <Input
              label="Contract End Reason"
              className="w-full"
              placeholder="Enter here..."
            />
          </FormItem>
          <div className={classNames(FORM_FIELD_WIDTHS["4"], "xl:col-span-2")}>
            <FilePicker
              multiple={false}
              className="w-full"
              label="Contract Document"
              disabled={contractDocUpload.isUploading}
              dropText="Drop your document here or"
              browseText="browse"
              value={contractDocPickerValue}
              accept={{
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
                "application/pdf": [".pdf"],
              }}
              onFileSelect={contractDocUpload.handleFileSelect}
            />
          </div>
        </div>
      </div>
    </Form>
  );
});

Step2.displayName = "Step2";

export default Step2;
