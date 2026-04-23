"use client";
import { useMemo } from "react";
import { Row } from "primereact/row";
import { Column } from "primereact/column";
import { classNames } from "primereact/utils";
import { ColumnGroup } from "primereact/columngroup";
import { ProgressSpinner } from "primereact/progressspinner";

import { Table } from "@/components";
import { getLeaveEligibilityTableColumns } from "../helpers";
import { LeaveEligibilityReport } from "@/lib/db/services/leave-eligibility";

interface LeaveEligibilityTableProps {
  isLoading: boolean;
  isPrinting?: boolean;
  searchEmployeeCode: number | null;
  report: LeaveEligibilityReport | null;
}

export const LeaveEligibilityTable = ({
  report,
  isLoading,
  searchEmployeeCode,
  isPrinting = false,
}: LeaveEligibilityTableProps) => {
  const data = useMemo(() => {
    return (report?.monthlyStats || []).map((item, index) => ({
      ...item,
      index: index + 1,
      group: "all",
    }));
  }, [report]);

  const columns = useMemo(() => getLeaveEligibilityTableColumns(), []);

  const footerColumnGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total Work Days:"
          colSpan={2}
          footerStyle={{
            textAlign: "right",
            fontWeight: "700",
            paddingRight: "20px",
            fontSize: "15px",
            color: "#6b7280", // text-gray-500 equivalent
          }}
        />
        <Column
          footer={report?.totalWorkingDays || 0}
          footerStyle={{
            textAlign: "center",
            fontWeight: "700",
            fontSize: "16px",
            color: "var(--primary-color, #f43f5e)", // use primary color
          }}
        />
      </Row>
      <Row>
        <Column
          footer="Work Days Required for eligible to vacation:"
          colSpan={2}
          footerStyle={{
            textAlign: "right",
            fontWeight: "700",
            paddingRight: "20px",
            fontSize: "15px",
            color: "#6b7280",
          }}
        />
        <Column
          footer="624"
          footerStyle={{
            textAlign: "center",
            fontWeight: "700",
            fontSize: "16px",
            color: "var(--primary-color, #f43f5e)",
          }}
        />
      </Row>
      <Row>
        <Column
          footer="Work Days remaining for Vacation:"
          colSpan={2}
          footerStyle={{
            textAlign: "right",
            fontWeight: "700",
            paddingRight: "20px",
            fontSize: "15px",
            color: "#6b7280",
          }}
        />
        <Column
          footer={report ? 624 - report.totalWorkingDays : 0}
          footerStyle={{
            textAlign: "center",
            fontWeight: "700",
            fontSize: "16px",
            color:
              report && 624 - report.totalWorkingDays > 0 ? "red" : "green",
          }}
        />
      </Row>
    </ColumnGroup>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <ProgressSpinner style={{ width: "50px", height: "50px" }} />
      </div>
    );
  }

  if (!report) {
    return (
      <div
        className={classNames("bg-white p-8 rounded-xl text-center", {
          "text-primary": searchEmployeeCode,
          "text-gray-500": !searchEmployeeCode,
        })}
      >
        {searchEmployeeCode
          ? "No data found for this employee."
          : "Enter an employee code and click search to generate the leave eligibility report."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Standard Employee Info Header */}
      <div className="bg-white rounded-xl py-4 px-4">
        <div
          className={classNames("flex flex-1 gap-3 justify-between", {
            "flex-row items-center": isPrinting,
            "flex-col sm:flex-row items-start sm:items-center": !isPrinting,
          })}
        >
          <div
            className={classNames("flex flex-1 gap-x-2 gap-y-1", {
              "flex-row items-center": isPrinting,
              "flex-col lg:flex-row items-start lg:items-center": !isPrinting,
            })}
          >
            <div className="flex gap-x-2 items-center">
              <span className="font-bold">{report.employee.employeeCode}</span>
              <span className="text-gray-400 font-semibold">-</span>
              <span className="font-semibold uppercase tracking-tight">
                {report.employee.nameEn}
              </span>
            </div>
            <div className="flex gap-x-2 items-center">
              <span
                className={classNames("text-gray-400", {
                  "hidden lg:block": !isPrinting,
                  inline: isPrinting,
                })}
              >
                |
              </span>
              <div className="flex gap-x-2 items-center">
                <span className="text-sm text-gray-600 tracking-tighter">
                  ID Card:
                </span>
                <span className="text-sm font-semibold text-primary">
                  {report.employee.idCardNo || "-"}
                </span>
              </div>
            </div>
          </div>
          <div
            className={classNames("flex justify-end", {
              "w-auto": isPrinting,
              "w-full sm:w-auto": !isPrinting,
            })}
          >
            <span className="text-sm font-bold text-right text-primary uppercase">
              {report.employee.nationalityCode
                ? `${report.employee.nationalityCode}, `
                : ""}
              {report.employee.designation}
            </span>
          </div>
        </div>
      </div>

      <div
        className={classNames("border-[0.5px] rounded-xl py-4 px-4", {
          "bg-theme-light-green border-theme-green":
            report.eligibilityStatus.isEligible,
          "bg-primary-light border-primary":
            !report.eligibilityStatus.isEligible,
          "hidden lg:block": !isPrinting,
          inline: isPrinting,
        })}
      >
        <p
          className={classNames("font-bold text-center w-full tracking-tight", {
            "text-green-600": report.eligibilityStatus.isEligible,
            "text-primary": !report.eligibilityStatus.isEligible,
          })}
        >
          {report.eligibilityStatus.message}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="px-1 flex justify-between items-end">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
            Working Days Statement
          </h3>
          <span className="text-xs font-semibold text-theme-text-gray">
            Calculation Start Date: {report.startDate}
          </span>
        </div>

        {/* Main Table */}
        <div className="bg-white overflow-hidden">
          <Table
            dataKey="index"
            data={data}
            columns={columns}
            pagination={false}
            globalSearch={false}
            filterDisplay={undefined}
            sortMode={undefined}
            showGridlines
            footerColumnGroup={footerColumnGroup}
            groupRowsBy="group"
            tableClassName="report-table"
          />
        </div>
      </div>
    </div>
  );
};
