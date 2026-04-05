"use client";
import React from "react";
import { classNames } from "primereact/utils";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { FormItem, Input, FilePicker } from "@/components/forms";

interface ContractAttachmentFieldsProps {
  remainingDays: string;
  contractDocUpload: any;
  contractDocPickerValue: any[];
}

const ContractAttachmentFields: React.FC<ContractAttachmentFieldsProps> = ({
  remainingDays,
  contractDocUpload,
  contractDocPickerValue,
}) => {
  return (
    <>
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
        name="contractEndReason"
        className={classNames(FORM_FIELD_WIDTHS["4"])}
      >
        <Input
          label="Contract End Reason"
          className="w-full"
          placeholder="Enter here..."
        />
      </FormItem>
      <div className={classNames(FORM_FIELD_WIDTHS["4"], "xl:col-span-2")}>
        <FilePicker
          multiple={false}
          className="w-full"
          label="Contract Document"
          disabled={contractDocUpload.isUploading}
          dropText="Drop your document here or"
          browseText="browse"
          value={contractDocPickerValue}
          accept={{
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "application/pdf": [".pdf"],
          }}
          onFileSelect={contractDocUpload.handleFileSelect}
        />
      </div>
    </>
  );
};

export default ContractAttachmentFields;
