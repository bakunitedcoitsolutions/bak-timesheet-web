"use client";
import { useState } from "react";
import { classNames } from "primereact/utils";

import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { StepperFormHeading } from "@/components/common";
import { Dropdown, FilePicker, Input, NumberInput } from "@/components/forms";
import { branchesData } from "@/utils/dummy";

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const countryOptions = [{ label: "Saudi Arabia", value: "saudi" }];

const cityOptions = [
  { label: "Riyadh", value: "riyadh" },
  { label: "Jeddah", value: "jeddah" },
  { label: "Mecca", value: "mecca" },
  { label: "Medina", value: "medina" },
  { label: "Tabuk", value: "tabuk" },
  { label: "Hail", value: "hail" },
  { label: "Jazan", value: "jazan" },
  { label: "Najran", value: "najran" },
  { label: "Al-Baha", value: "al-baha" },
];

const designationOptions = [
  { label: "All Designations", value: "0" },
  { label: "Engineer", value: "1" },
  { label: "Manager", value: "2" },
  { label: "Assistant", value: "3" },
  { label: "Other", value: "4" },
];

const payrollSectionOptions = [
  { label: "All Payroll Sections", value: "0" },
  { label: "Engineering", value: "1" },
  { label: "Management", value: "2" },
  { label: "Administration", value: "3" },
  { label: "Other", value: "4" },
];

const employeeStatusOptions = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
];

const isFixedOptions = [
  {
    label: "Yes",
    value: "1",
  },
  {
    label: "No",
    value: "2",
  },
];

interface Step2Props {
  employeeId?: number | null;
}

const Step2 = ({ employeeId }: Step2Props) => {
  // Row 1
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  // Row 2
  const [selectedDesignation, setSelectedDesignation] = useState<string | null>(
    null
  );
  const [selectedPayrollSection, setSelectedPayrollSection] = useState<
    string | null
  >(null);
  const [selectedEmployeeStatus, setSelectedEmployeeStatus] = useState<
    string | null
  >(null);

  // Row 3
  const [selectedIsFixed, setSelectedIsFixed] = useState<string | null>(null);
  const [selectedIsDeductable, setSelectedIsDeductable] = useState<
    string | null
  >(null);

  const [contractDocument, setContractDocument] = useState<File | null>(null);

  return (
    <div className="flex flex-1 md:flex-none flex-col gap-4 py-6">
      <StepperFormHeading title="Contract Details" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
        {/* First Row */}
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <Dropdown
            label="Gender"
            className="w-full"
            options={genderOptions}
            placeholder="Choose"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.value)}
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"], "xl:col-span-2")}>
          <Dropdown
            label="Country"
            className="w-full"
            options={countryOptions}
            placeholder="Choose"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.value)}
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <Dropdown
            label="City"
            className="w-full"
            options={cityOptions}
            placeholder="Choose"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.value)}
          />
        </div>
        {/* Mobile Separator */}
        <div className="w-full h-px mt-2 mb-2 bg-primary-light block md:hidden" />

        {/* Second Row */}
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <Dropdown
            label="Employee Status"
            className="w-full"
            options={employeeStatusOptions}
            placeholder="Choose"
            value={selectedEmployeeStatus}
            onChange={(e) => setSelectedEmployeeStatus(e.value)}
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <Dropdown
            label="Branch"
            className="w-full"
            placeholder="Choose"
            options={branchesData.map((branch) => ({
              label: branch.nameEn,
              value: branch.id,
            }))}
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.value)}
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <Dropdown
            label="Designation"
            className="w-full"
            options={designationOptions}
            placeholder="Choose"
            value={selectedDesignation}
            onChange={(e) => setSelectedDesignation(e.value)}
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <Dropdown
            label="Payroll Section"
            className="w-full"
            options={payrollSectionOptions}
            placeholder="Choose"
            value={selectedPayrollSection}
            onChange={(e) => setSelectedPayrollSection(e.value)}
          />
        </div>

        {/* Mobile Separator */}
        <div className="w-full h-px mt-2 mb-2 bg-primary-light block md:hidden" />

        {/* Third Row */}
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <Dropdown
            label="Is Fixed?"
            className="w-full"
            options={isFixedOptions}
            placeholder="Choose"
            value={selectedIsFixed}
            onChange={(e) => setSelectedIsFixed(e.value)}
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <Dropdown
            className="w-full"
            placeholder="Choose"
            label="Is Deductable?"
            options={isFixedOptions}
            value={selectedIsDeductable}
            onChange={(e) => setSelectedIsDeductable(e.value)}
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <NumberInput
            min={0}
            maxLength={2}
            className="w-full"
            label="Working Days"
            useGrouping={false}
            placeholder="Enter working days"
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <NumberInput
            min={0}
            maxLength={3}
            className="w-full"
            label="Working Hours"
            useGrouping={false}
            placeholder="Enter working hours"
          />
        </div>

        {/* Mobile Separator */}
        <div className="w-full h-px mt-2 mb-2 bg-primary-light block md:hidden" />

        {/* Fourth Row */}
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <NumberInput
            min={0}
            maxLength={5}
            className="w-full"
            useGrouping={false}
            label={selectedIsFixed === "1" ? "Salary" : "Hourly Rate"}
            placeholder={
              selectedIsFixed === "1" ? "Enter salary" : "Enter hourly rate"
            }
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <NumberInput
            min={0}
            maxLength={5}
            className="w-full"
            useGrouping={false}
            label="Food Allowance"
            placeholder="Enter food allowance"
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <NumberInput
            min={0}
            maxLength={5}
            className="w-full"
            useGrouping={false}
            label="Mobile Allowance"
            placeholder="Enter mobile allowance"
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <NumberInput
            min={0}
            maxLength={5}
            className="w-full"
            useGrouping={false}
            label="Other Allowance"
            placeholder="Enter other allowance"
          />
        </div>

        {/* Mobile Separator */}
        <div className="w-full h-px mt-2 mb-2 bg-primary-light block md:hidden" />

        {/* Fifth Row */}
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <Input
            type="date"
            className="w-full"
            label="Contract Start Date"
            placeholder="Enter contract start date"
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <Input
            type="date"
            className="w-full"
            label="Contract End Date"
            placeholder="Enter contract end date"
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <NumberInput
            disabled
            maxLength={5}
            placeholder="N/A"
            className="w-full"
            useGrouping={false}
            label="Contract Rem. Days"
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"])}>
          <Input
            type="date"
            className="w-full"
            label="Joining Date"
            placeholder="Enter joining date"
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"], "xl:col-span-2")}>
          <div className="w-full">
            <FilePicker
              multiple={false}
              className="w-full"
              label="Contract Document"
              dropText="Drop your document here or"
              browseText="browse"
              accept={{
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
                "application/pdf": [".pdf"],
              }}
              onFileSelect={(files: File[]) => {
                if (files) {
                  const file = files[0];
                  setContractDocument(file);
                }
              }}
            />
          </div>
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["4"], "xl:col-span-2")}>
          <Input
            className="w-full"
            placeholder="Enter here..."
            label="Contract End Reason"
          />
        </div>
      </div>
    </div>
  );
};

export default Step2;
