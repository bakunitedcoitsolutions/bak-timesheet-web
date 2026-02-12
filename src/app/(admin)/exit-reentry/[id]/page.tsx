"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { classNames } from "primereact/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  useUpdateExitReentry,
  useCreateExitReentry,
  useGetExitReentryById,
} from "@/lib/db/services/exit-reentry/requests";
import {
  CreateExitReentrySchema,
  UpdateExitReentrySchema,
} from "@/lib/db/services/exit-reentry/exit-reentry.schemas";
import {
  useGlobalData,
  GlobalDataEmployee,
  GlobalDataDesignation,
} from "@/context/GlobalDataContext";
import { toastService } from "@/lib/toast";
import { getEntityModeFromParam } from "@/helpers";
import { getErrorMessage } from "@/utils/helpers";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import {
  Input,
  Button,
  Dropdown,
  Form,
  FormItem,
  Textarea,
} from "@/components/forms";
import { StepperFormHeading } from "@/components";

const exitReentryTypeOptions = [
  { label: "Exit", value: "EXIT" },
  { label: "Entry", value: "ENTRY" },
];

const UpsertExitReentryPage = () => {
  const router = useRouter();
  const { id: exitReentryIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: exitReentryId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: exitReentryIdParam,
  });

  const { mutateAsync: createExitReentry } = useCreateExitReentry();
  const { mutateAsync: updateExitReentry } = useUpdateExitReentry();
  const { data: foundExitReentry, isLoading } = useGetExitReentryById({
    id: exitReentryId ? Number(exitReentryId) : 0,
  });

  // Fetch global data
  const { data: globalData } = useGlobalData();
  const employees = globalData.employees || [];
  const designations = globalData.designations || [];

  // Create a map for quick designation lookup
  const designationsMap = useMemo(() => {
    const map = new Map<number, GlobalDataDesignation>();
    designations.forEach((des: GlobalDataDesignation) => {
      map.set(des.id, des);
    });
    return map;
  }, [designations]);

  const employeeOptions = employees.map((employee: GlobalDataEmployee) => ({
    label: `${employee.employeeCode} - ${employee.nameEn}`,
    value: employee.id,
  }));

  const zodSchema = isEditMode
    ? UpdateExitReentrySchema
    : CreateExitReentrySchema;

  const defaultValues = {
    ...(isEditMode ? { id: 0 } : {}),
    employeeId: undefined as number | undefined,
    date: "",
    type: undefined as "EXIT" | "ENTRY" | undefined,
    remarks: "",
  };

  const form = useForm({
    resolver: zodResolver(zodSchema) as any,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = form;

  const selectedEmployeeId = watch("employeeId");

  // Get employee designation when employee is selected
  const selectedEmployee = employees.find(
    (emp: GlobalDataEmployee) => emp.id === selectedEmployeeId
  );

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  useEffect(() => {
    if (foundExitReentry) {
      const setExitReentry = {
        ...(isEditMode ? { id: foundExitReentry?.id ?? 0 } : {}),
        employeeId: foundExitReentry?.employeeId,
        date: foundExitReentry?.date
          ? new Date(foundExitReentry.date).toISOString().split("T")[0]
          : "",
        type: foundExitReentry?.type,
        remarks: foundExitReentry?.remarks || "",
      };
      reset(setExitReentry);
    }
  }, [foundExitReentry, isEditMode, reset]);

  const onFormSubmit = handleSubmit(async (data) => {
    if (isAddMode) {
      await handleCreateExitReentry(data);
    } else {
      await handleUpdateExitReentry(data);
    }
  });

  const handleCreateExitReentry = async (data: any) => {
    try {
      await createExitReentry(data, {
        onSuccess: () => {
          toastService.showSuccess(
            "Done",
            "Exit/Re-entry created successfully"
          );
          router.replace("/exit-reentry");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(
            error,
            "Failed to create exit/re-entry"
          );
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {
      // Error handled in onError callback
    }
  };

  const handleUpdateExitReentry = async (data: any) => {
    try {
      await updateExitReentry(data, {
        onSuccess: () => {
          toastService.showSuccess(
            "Done",
            "Exit/Re-entry updated successfully"
          );
          router.replace("/exit-reentry");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(
            error,
            "Failed to update exit/re-entry"
          );
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {
      // Error handled in onError callback
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading
          title={isAddMode ? "Add Exit/Re-entry" : "Edit Exit/Re-entry"}
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
                  <FormItem name="date">
                    <Input
                      type="date"
                      label="Date"
                      className="w-full"
                      placeholder="Select date"
                    />
                  </FormItem>
                </div>
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="employeeId">
                    <Dropdown
                      filter
                      label="Employee"
                      className="w-full"
                      options={employeeOptions}
                      placeholder="Choose"
                      showClear
                    />
                  </FormItem>
                </div>
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="type">
                    <Dropdown
                      label="Type"
                      className="w-full"
                      options={exitReentryTypeOptions}
                      placeholder="Choose"
                    />
                  </FormItem>
                </div>
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <Input
                    disabled
                    label="Designation"
                    className="w-full"
                    placeholder="Designation will appear here..."
                    value={
                      selectedEmployee?.designationId
                        ? designationsMap.get(selectedEmployee.designationId)
                            ?.nameEn || "-"
                        : "-"
                    }
                  />
                </div>
                <div
                  className={classNames(
                    FORM_FIELD_WIDTHS["2"],
                    "md:col-span-2 max-w-full"
                  )}
                >
                  <FormItem name="remarks">
                    <Textarea
                      label="Remarks"
                      className="w-full"
                      placeholder="Enter remarks..."
                      rows={4}
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
                onClick={() => router.replace("/exit-reentry")}
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

export default UpsertExitReentryPage;
