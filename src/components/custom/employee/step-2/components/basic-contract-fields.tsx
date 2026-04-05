"use client";
import React from "react";
import { classNames } from "primereact/utils";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { FormItem, Dropdown } from "@/components/forms";

interface BasicContractFieldsProps {
  options: any;
  isBranchScoped: boolean;
}

const BasicContractFields: React.FC<BasicContractFieldsProps> = ({
  options,
  isBranchScoped,
}) => {
  return (
    <>
      {/* First Row */}
      <FormItem name="gender" className={classNames(FORM_FIELD_WIDTHS["4"])}>
        <Dropdown
          label="Gender"
          className="w-full"
          options={options.gender}
          placeholder="Choose"
        />
      </FormItem>
      <FormItem name="countryId" className={classNames(FORM_FIELD_WIDTHS["4"])}>
        <Dropdown
          filter
          label="Country"
          className="w-full"
          options={options.countries}
          placeholder="Choose"
        />
      </FormItem>
      <FormItem name="cityId" className={classNames(FORM_FIELD_WIDTHS["4"])}>
        <Dropdown
          filter
          label="City"
          className="w-full"
          options={options.cities}
          placeholder="Choose"
        />
      </FormItem>
      <FormItem name="statusId" className={classNames(FORM_FIELD_WIDTHS["4"])}>
        <Dropdown
          filter
          label="Employee Status"
          className="w-full"
          options={options.employeeStatuses}
          placeholder="Choose"
        />
      </FormItem>

      {/* Mobile Separator */}
      <div className="w-full h-px mt-2 mb-2 bg-primary-light block md:hidden" />

      {/* Second Row */}
      <FormItem name="branchId" className={classNames(FORM_FIELD_WIDTHS["4"])}>
        <Dropdown
          filter
          label="Branch"
          className="w-full"
          placeholder="Choose"
          disabled={isBranchScoped}
          options={options.branches?.filter?.((branch: any) => branch?.isMain)}
        />
      </FormItem>
      <FormItem
        name="subBranchId"
        className={classNames(FORM_FIELD_WIDTHS["4"])}
      >
        <Dropdown
          filter
          showClear
          label="Sub Branch"
          className="w-full"
          placeholder="Choose"
          options={
            options.branches?.filter?.((branch: any) => !branch?.isMain) || []
          }
        />
      </FormItem>
      <FormItem
        name="designationId"
        className={classNames(FORM_FIELD_WIDTHS["4"])}
      >
        <Dropdown
          filter
          label="Designation"
          className="w-full"
          options={options.designations}
          placeholder="Choose"
        />
      </FormItem>
      <FormItem
        name="payrollSectionId"
        className={classNames(FORM_FIELD_WIDTHS["4"])}
      >
        <Dropdown
          filter
          label="Payroll Section"
          className="w-full"
          options={options.payrollSections}
          placeholder="Choose"
        />
      </FormItem>
    </>
  );
};

export default BasicContractFields;
