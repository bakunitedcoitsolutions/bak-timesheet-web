"use client";
import React from "react";
import { classNames } from "primereact/utils";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { FormItem, Dropdown, FilePicker } from "@/components/forms";

interface BankCardDetailsSectionProps {
  isCardDeliveredOptions: any[];
  fileUpload: any;
  pickerValue: any[];
}

const BankCardDetailsSection: React.FC<BankCardDetailsSectionProps> = ({
  isCardDeliveredOptions,
  fileUpload,
  pickerValue,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
      <FormItem
        name="isCardDelivered"
        className={classNames(FORM_FIELD_WIDTHS["2"])}
      >
        <Dropdown
          className="w-full"
          label="Is Card Delivered?"
          options={isCardDeliveredOptions}
          placeholder="Choose"
        />
      </FormItem>
      <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
        <div className="w-full md:w-60 xl:w-72">
          <FilePicker
            multiple={false}
            className="w-full"
            label="Card Document"
            disabled={fileUpload.isUploading}
            dropText="Drop card document here or"
            browseText="browse"
            value={pickerValue}
            accept={{
              "image/jpeg": [".jpg", ".jpeg"],
              "image/png": [".png"],
              "application/pdf": [".pdf"],
            }}
            onFileSelect={fileUpload.handleFileSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default BankCardDetailsSection;
