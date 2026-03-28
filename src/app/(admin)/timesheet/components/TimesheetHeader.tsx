"use client";
import React from "react";
import { TitleHeader } from "@/components";

interface TimesheetHeaderProps {
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TimesheetHeader = ({
  searchValue,
  onSearchChange,
}: TimesheetHeaderProps) => {
  return (
    <TitleHeader
      showBack={false}
      title="ATTENDANCE SHEET"
      icon={<i className="fa-light fa-calendar text-xl!" />}
      value={searchValue}
      onChange={onSearchChange}
    />
  );
};
