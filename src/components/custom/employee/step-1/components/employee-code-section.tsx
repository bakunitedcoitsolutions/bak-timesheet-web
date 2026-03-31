"use client";
import React from "react";
import { classNames } from "primereact/utils";

import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { FormItem, NumberInput, Checkbox } from "@/components/forms";

const EmployeeCodeSection: React.FC = () => {
  return (
    <div
      className={classNames(
        FORM_FIELD_WIDTHS["2"],
        "px-6 mt-4 xl:pl-0 xl:mt-0"
      )}
    >
      <FormItem name="employeeCode" className="mt-1.5 mb-1">
        <NumberInput
          label="Employee Code"
          useGrouping={false}
          labelClassName="mb-2!"
          className="w-full md:w-60 xl:w-72"
          placeholder="Enter employee code"
        />
      </FormItem>
      <FormItem name="reassignEmployeeCode" valueName="checked">
        <Checkbox name="Override" label="Override" labelClassName="mt-0.5!" />
      </FormItem>
    </div>
  );
};

export default EmployeeCodeSection;
