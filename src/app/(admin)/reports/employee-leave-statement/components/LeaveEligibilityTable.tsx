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
  const columns = useMemo(() => getLeaveEligibilityTableColumns(), []);

  const getFooterGroup = (totalDays: number, isPrevious?: boolean) => {
    const gender = (report?.employee.gender || "Male").toLowerCase();
    const pronoun = gender === "male" ? "He" : "She";
    const pronounSmall = gender === "male" ? "he" : "she";
    const isEligible = totalDays >= 624;
    const diffDays = Math.abs(totalDays - 624);

    const message = isEligible
      ? `${pronoun} was eligible to go on vacation, ${pronounSmall} exceeded ${diffDays} day(s).`
      : `${pronoun} wasn't eligible for vacation, ${diffDays} day(s) were remaining.`;

    return (
      <ColumnGroup>
        {isPrevious && (
          <Row>
            <Column
              footer={message}
              colSpan={3}
              footerStyle={{
                textAlign: "center",
                fontWeight: "700",
                padding: "10px",
                fontSize: "14px",
                color: isEligible ? "#16a34a" : "var(--primary-color, #af1e2e)",
              }}
            />
          </Row>
        )}
        <Row>
          <Column
            footer="Total Work Days:"
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
            footer={totalDays}
            footerStyle={{
              textAlign: "center",
              fontWeight: "700",
              fontSize: "16px",
              color: "var(--primary-color, #af1e2e)",
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
              color: "var(--primary-color, #af1e2e)",
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
            footer={624 - totalDays}
            footerStyle={{
              textAlign: "center",
              fontWeight: "700",
              fontSize: "16px",
              color: 624 - totalDays > 0 ? "#f43f5e" : "#16a34a",
            }}
          />
        </Row>
      </ColumnGroup>
    );
  };

  const renderCycleTable = (
    cycle: {
      monthlyStats: any[];
      totalWorkingDays: number;
      startDate: string;
      endDate?: string | null;
    },
    title: string,
    isPrevious?: boolean
  ) => {
    const data = (cycle.monthlyStats || []).map((item, index) => ({
      ...item,
      index: index + 1,
      group: "all",
    }));

    if (data.length === 0 && !cycle.endDate) return null;

    return (
      <div
        className="flex flex-col gap-1.5"
        key={`${cycle.startDate}-${cycle.endDate}`}
      >
        <div className="px-1 flex justify-between items-end">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
            {title}
          </h3>
          <span className="text-sm font-semibold text-theme-text-gray">
            <span className="text-primary">{cycle.startDate}</span>{" "}
            <span>-</span>{" "}
            <span className="text-primary">
              {cycle.endDate ? cycle.endDate : "Today"}
            </span>
          </span>
        </div>

        <div className="bg-white overflow-hidden border border-gray-100">
          <Table
            dataKey="index"
            data={data}
            columns={columns}
            pagination={false}
            globalSearch={false}
            filterDisplay={undefined}
            sortMode={undefined}
            showGridlines
            footerColumnGroup={getFooterGroup(
              cycle.totalWorkingDays,
              isPrevious
            )}
            groupRowsBy="group"
            tableClassName="report-table"
          />
        </div>
      </div>
    );
  };

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
    <div className="flex flex-col gap-8 pb-10">
      {/* Standard Employee Info Header */}
      <div className="bg-white rounded-xl py-4 px-4 sticky top-0 z-10">
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

      {/* Current Eligibility Status */}
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

      {/* Tables Section */}
      <div className="flex flex-col gap-10">
        {/* Current Working Cycle */}
        {renderCycleTable(
          {
            monthlyStats: report.monthlyStats,
            totalWorkingDays: report.totalWorkingDays,
            startDate: report.startDate,
            endDate: null,
          },
          "Current Working Period",
          false
        )}

        {/* Previous Working Cycles */}
        {report.previousCycles && report.previousCycles.length > 0 && (
          <div className="flex flex-col gap-10">
            {report.previousCycles.map((cycle, index) =>
              renderCycleTable(
                cycle,
                `Previous Working Period ${report.previousCycles.length - index}`,
                true
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
