"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { classNames } from "primereact/utils";
import { StepperFormHeading } from "@/components";
import { getEntityModeFromParam } from "@/helpers";
import { initialTimesheetData } from "@/utils/dummy";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { Button, Dropdown, Input, NumberInput } from "@/components/forms";

const loanTypeOptions = [
  { label: "Loan", value: "1" },
  { label: "Return", value: "2" },
];

const UpsertLoanPage = () => {
  const router = useRouter();
  const { id: loanIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: loanId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: loanIdParam,
  });

  const [selectedLoanType, setSelectedLoanType] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Form submitted:", data);
    // Handle form submission here
    router.replace(`/loans`);
  };

  const employeeOptions = initialTimesheetData.map((timesheet) => ({
    label: `${timesheet.code} - ${timesheet.employeeName}`,
    value: timesheet.id,
  }));

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading title={isAddMode ? "Add Loan" : "Edit Loan"} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-8 md:py-5 px-6 mt-5 md:mt-0 max-w-5xl content-start flex-1">
          <div className={classNames(FORM_FIELD_WIDTHS["2"], "max-w-full")}>
            <Input
              type="date"
              label="Date"
              className="w-full"
              placeholder="Select date"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"], "max-w-full")}>
            <Dropdown
              small
              filter
              label="Employee"
              className="w-full"
              options={employeeOptions}
              placeholder="Choose"
              selectedItem={selectedEmployee}
              setSelectedItem={setSelectedEmployee}
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"], "max-w-full")}>
            <Dropdown
              label="Type"
              className="w-full"
              options={loanTypeOptions}
              placeholder="Choose"
              selectedItem={selectedLoanType}
              setSelectedItem={setSelectedLoanType}
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"], "max-w-full")}>
            <NumberInput
              label="Amount"
              className="w-full"
              placeholder="Enter amount"
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
            onClick={() => router.replace("/loans")}
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

export default UpsertLoanPage;
