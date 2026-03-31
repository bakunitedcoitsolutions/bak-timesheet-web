"use client";
import React from "react";
import { classNames } from "primereact/utils";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { FormItem, Input, FilePicker, Dropdown } from "@/components/forms";

interface PassportSectionProps {
  nationalityOptions: any[];
  fileUpload: any;
  pickerValue: any[];
}

const PassportSection: React.FC<PassportSectionProps> = ({
  nationalityOptions,
  fileUpload,
  pickerValue,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
      <FormItem
        name="nationalityId"
        className={classNames(FORM_FIELD_WIDTHS["2"])}
      >
        <Dropdown
          label="Nationality"
          className="w-full"
          options={nationalityOptions}
          placeholder="Choose"
        />
      </FormItem>
      <FormItem
        name="passportNo"
        className={classNames(FORM_FIELD_WIDTHS["2"])}
      >
        <Input
          className="w-full uppercase placeholder:normal-case"
          label="Passport No."
          placeholder="Enter passport number"
        />
      </FormItem>
      <FormItem
        name="passportExpiryDate"
        className={classNames(FORM_FIELD_WIDTHS["2"])}
      >
        <Input
          type="date"
          className="w-full"
          label="Passport Expiry Date"
          placeholder="Enter passport expiry date"
        />
      </FormItem>
      <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
        <FilePicker
          multiple={false}
          className="w-full"
          label="Passport Document"
          disabled={fileUpload.isUploading}
          dropText="Drop your document here or"
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
  );
};

export default PassportSection;
