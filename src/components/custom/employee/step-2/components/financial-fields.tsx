"use client";
import React from "react";
import { classNames } from "primereact/utils";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { FormItem, NumberInput, Dropdown } from "@/components/forms";

interface FinancialFieldsProps {
  options: any;
  isFixed: boolean | undefined;
  handleSalaryBlur: () => void;
}

const FinancialFields: React.FC<FinancialFieldsProps> = ({
  options,
  isFixed,
  handleSalaryBlur,
}) => {
  return (
    <>
      <FormItem name="isFixed" className={classNames(FORM_FIELD_WIDTHS["4"])}>
        <Dropdown
          label="Is Fixed?"
          className="w-full"
          options={options.isFixed}
          placeholder="Choose"
        />
      </FormItem>
      <FormItem
        name="isDeductable"
        className={classNames(FORM_FIELD_WIDTHS["4"])}
      >
        <Dropdown
          className="w-full"
          placeholder="Choose"
          label="Is Deductable?"
          options={options.isDeductable}
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
      <FormItem name="salary" className={classNames(FORM_FIELD_WIDTHS["4"])}>
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
          options={options.isFixed}
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
    </>
  );
};

export default FinancialFields;
