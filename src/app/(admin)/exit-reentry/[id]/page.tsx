"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { classNames } from "primereact/utils";
import { StepperFormHeading } from "@/components";
import { getEntityModeFromParam } from "@/helpers";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { Button, Dropdown, Input } from "@/components/forms";
import { initialTimesheetData, designationsData } from "@/utils/dummy";

const exitReentryTypeOptions = [
  { label: "Exit", value: "1" },
  { label: "Entry", value: "2" },
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

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [designation, setDesignation] = useState<string>("");
  const [designationId, setDesignationId] = useState<number | null>(null);

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  // Update designation name and ID when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      const employeeId = parseInt(selectedEmployee, 10);
      const employee = initialTimesheetData.find(
        (emp) => emp.id === employeeId
      );
      if (employee) {
        // Find designation ID by matching the designation name
        const designationObj = designationsData.find(
          (des) => des.nameEn === employee.designation
        );
        setDesignation(employee.designation);
        setDesignationId(designationObj?.id || null);
      } else {
        setDesignation("");
        setDesignationId(null);
      }
    } else {
      setDesignation("");
      setDesignationId(null);
    }
  }, [selectedEmployee]);

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Form submitted:", {
      ...data,
      employeeId: selectedEmployee ? parseInt(selectedEmployee, 10) : null,
      designationId: designationId,
      type:
        selectedType === "1" ? "EXIT" : selectedType === "2" ? "ENTRY" : null,
    });
    // Handle form submission here - use designationId for saving to DB
    router.replace(`/exit-reentry`);
  };

  const employeeOptions = initialTimesheetData.map((timesheet) => ({
    label: `${timesheet.code} - ${timesheet.employeeName}`,
    value: timesheet.id.toString(),
  }));

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading
          title={isAddMode ? "Add Exit/Re-entry" : "Edit Exit/Re-entry"}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-8 md:py-5 px-6 mt-5 md:mt-0 max-w-5xl content-start flex-1">
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input
              type="date"
              label="Date"
              className="w-full"
              placeholder="Select date"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Dropdown
              small
              filter
              label="Employee"
              className="w-full"
              options={employeeOptions}
              placeholder="Choose"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.value)}
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Dropdown
              label="Type"
              className="w-full"
              options={exitReentryTypeOptions}
              placeholder="Choose"
              value={selectedType}
              onChange={(e) => setSelectedType(e.value)}
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input
              disabled
              label="Designation"
              className="w-full"
              placeholder="Enter designation..."
              value={designation}
            />
          </div>
          <div
            className={classNames(
              FORM_FIELD_WIDTHS["2"],
              "md:col-span-2 max-w-full"
            )}
          >
            <Input
              label="Remarks"
              className="w-full"
              placeholder="Enter remarks..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end px-6">
          <Button
            size="small"
            variant="text"
            onClick={() => router.replace("/exit-reentry")}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="solid"
            onClick={handleSubmit}
            className="w-28 justify-center!"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpsertExitReentryPage;
