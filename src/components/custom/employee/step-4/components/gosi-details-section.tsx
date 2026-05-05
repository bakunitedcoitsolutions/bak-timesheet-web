"use client";
import React from "react";
import { classNames } from "primereact/utils";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { FormItem, Dropdown, NumberInput } from "@/components/forms";

interface GosiDetailsSectionProps {
  gosiCityOptions: any[];
}

const GosiDetailsSection: React.FC<GosiDetailsSectionProps> = ({
  gosiCityOptions,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
      <FormItem
        name="gosiSalary"
        className={classNames(FORM_FIELD_WIDTHS["2"])}
      >
        <NumberInput
          label="Salary"
          className="w-full"
          useGrouping={false}
          placeholder="Enter GOSI salary"
        />
      </FormItem>
      <FormItem
        name="gosiCityId"
        className={classNames(FORM_FIELD_WIDTHS["2"])}
      >
        <Dropdown
          filter
          label="City"
          className="w-full"
          options={gosiCityOptions}
          placeholder="GOSI City"
        />
      </FormItem>
    </div>
  );
};

export default GosiDetailsSection;
