"use client";
import React from "react";
import { classNames } from "primereact/utils";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { FormItem, Input, Dropdown } from "@/components/forms";

interface BankDetailsSectionProps {
  bankOptions: any[];
}

const BankDetailsSection: React.FC<BankDetailsSectionProps> = ({
  bankOptions,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
      <FormItem name="bankName" className={classNames(FORM_FIELD_WIDTHS["2"])}>
        <Dropdown
          filter
          label="Name"
          className="w-full"
          options={bankOptions}
          placeholder="Choose Bank"
        />
      </FormItem>
      <FormItem name="bankCode" className={classNames(FORM_FIELD_WIDTHS["2"])}>
        <Input className="w-full" label="Code" placeholder="Enter bank code" />
      </FormItem>
      <FormItem
        name="iban"
        className={classNames(FORM_FIELD_WIDTHS["2"], "md:col-span-2")}
      >
        <Input label="IBAN" className="w-full" placeholder="Enter IBAN" />
      </FormItem>
    </div>
  );
};

export default BankDetailsSection;
