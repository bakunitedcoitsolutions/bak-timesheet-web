"use client";
import React from "react";
import { classNames } from "primereact/utils";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { FormItem, Input } from "@/components/forms";

interface ContractDateFieldsProps {
  remainingDays: string;
}

const ContractDateFields: React.FC<ContractDateFieldsProps> = ({
  remainingDays,
}) => {
  return (
    <>
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
    </>
  );
};

export default ContractDateFields;
