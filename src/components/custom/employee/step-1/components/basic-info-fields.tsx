"use client";
import React from "react";

import { FormItem, Input } from "@/components/forms";
import MaskInput from "@/components/forms/mask-input";

const BasicInfoFields: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-8 md:py-5 px-6">
      <FormItem name="nameEn">
        <Input
          label="Full Name (En)"
          className="w-full"
          placeholder="Enter full name in English"
        />
      </FormItem>
      <FormItem name="nameAr">
        <Input
          label="Full Name (Ar)"
          className="w-full text-right"
          placeholder="أدخل الاسم الكامل بالعربية"
        />
      </FormItem>
      <FormItem name="dob">
        <Input
          label="Birth Date"
          type="date"
          className="w-full"
          placeholder="Select birth date"
        />
      </FormItem>
      <FormItem name="phone">
        <MaskInput
          label="Mobile Number"
          className="w-full"
          mask="999 999 9999"
          placeholder="Enter mobile number (without 966/+966)"
        />
      </FormItem>
    </div>
  );
};

export default BasicInfoFields;
