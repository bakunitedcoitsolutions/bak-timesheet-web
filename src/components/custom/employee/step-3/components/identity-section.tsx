"use client";
import React from "react";
import { classNames } from "primereact/utils";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { FormItem, Input, FilePicker } from "@/components/forms";

interface IdentitySectionProps {
  fileUpload: any;
  pickerValue: any[];
}

const IdentitySection: React.FC<IdentitySectionProps> = ({
  fileUpload,
  pickerValue,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
      <FormItem
        name="idCardNo"
        className={classNames(FORM_FIELD_WIDTHS["2"])}
      >
        <Input
          className="w-full"
          label="ID Card No."
          placeholder="Enter ID card number"
        />
      </FormItem>
      <FormItem
        name="idCardExpiryDate"
        className={classNames(FORM_FIELD_WIDTHS["2"])}
      >
        <Input
          type="date"
          className="w-full"
          label="ID Card Expiry Date"
          placeholder="Enter ID card expiry date"
        />
      </FormItem>
      <FormItem
        name="profession"
        className={classNames(FORM_FIELD_WIDTHS["2"])}
      >
        <Input
          className="w-full"
          label="Profession"
          placeholder="Enter profession"
        />
      </FormItem>
      <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
        <FilePicker
          multiple={false}
          className="w-full"
          label="ID Card Document"
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

export default IdentitySection;
