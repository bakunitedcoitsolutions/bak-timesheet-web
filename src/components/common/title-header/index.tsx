"use client";

import { ReactNode } from "react";
import { classNames } from "primereact/utils";
import { Input } from "@/components";

const TitleHeader = ({
  title,
  icon,
  children,
  value,
  onChange,
}: {
  title: string;
  icon: ReactNode;
  children?: ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div
      className={classNames(
        "bg-linear-to-r from-primary to-[#96313C] flex flex-col md:flex-row items-start md:items-center justify-between h-auto md:h-[80px] w-full py-5 px-6 gap-4"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-md bg-white/20 text-white">
          {icon}
        </div>
        <h1 className="text-lg md:text-xl uppercase font-semibold text-white">
          {title}
        </h1>
      </div>
      {children ?? (
        <div className="flex w-full md:w-auto items-center gap-4">
          <div className="w-full md:w-80">
            <Input
              value={value}
              className="w-full"
              icon="pi pi-search"
              iconPosition="left"
              onChange={onChange}
              placeholder="Search"
            />
          </div>
          <div className="w-10 h-10 flex items-center justify-center rounded-md cursor-pointer text-white">
            <i className="fa-regular fa-expand text-xl!" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TitleHeader;
