"use client";

import { useMemo } from "react";

import {
  calculateNetLoan,
  calculateTotalAllowances,
  calculateNetSalaryPayable,
  calculateNetTrafficChallan,
} from "../utils";
import { formatNum } from "@/utils/helpers";
import { ActionButtons } from "./ActionButtons";
import { StatusRowFilter } from "./StatusRowFilter";
import { useGlobalData } from "@/context/GlobalDataContext";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";
import { Input, Badge, Dropdown, TableColumn, NumberInput } from "@/components";

const tableCommonProps = {
  sortable: false,
  filterable: false,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 120 },
  headerClassName: "text-sm! font-semibold",
};

interface UsePayrollTableColumnsProps {
  payrollData: PayrollDetailEntry[];
  payrollSectionId?: number | null;
  isSavingAll: boolean;
  isLoading: boolean;
  isSavingRow: boolean;
  statusOptions: { label: string; value: number }[];
  paymentMethodOptions: { label: string; value: string }[];
  updatePayrollEntry: (
    id: number,
    field: keyof PayrollDetailEntry,
    value: any
  ) => void;
  updateSalaryPair: (
    id: number,
    changed: "cardSalary" | "cashSalary",
    rawValue: number
  ) => void;
  handleSaveSingleRowOnEnter: (
    payrollId: number,
    fieldName?: keyof PayrollDetailEntry,
    value?: any
  ) => void;
  handleRowRefreshComplete: (updated: PayrollDetailEntry) => void;
}

export const usePayrollTableColumns = ({
  payrollData,
  payrollSectionId,
  isSavingAll,
  isLoading,
  isSavingRow,
  statusOptions,
  paymentMethodOptions,
  updatePayrollEntry,
  updateSalaryPair,
  handleSaveSingleRowOnEnter,
  handleRowRefreshComplete,
}: UsePayrollTableColumnsProps) => {
  const { data: globalData } = useGlobalData();
  const designations = globalData.designations;
  const designationsOptions = designations.map((d) => ({
    label: d.nameEn,
    value: d.id,
  }));
  return useMemo(
    (): TableColumn<PayrollDetailEntry>[] => [
      {
        field: "empCode",
        header: "Emp. Code",
        ...tableCommonProps,
        filterable: true,
        style: { minWidth: 120, zIndex: 1 },
        headerStyle: { zIndex: 10 },
        frozen: true,
        body: (rowData: PayrollDetailEntry) => (
          <span className="text-sm font-semibold!">{rowData.empCode}</span>
        ),
      },
      {
        field: "name",
        header: "Name",
        ...tableCommonProps,
        filterable: true,
        style: { minWidth: 300, zIndex: 1 },
        headerStyle: { zIndex: 10 },
        frozen: true,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex items-start gap-2 min-w-0">
            <div className="flex flex-1 flex-col gap-1 min-w-0">
              <span className="text-sm font-medium leading-tight wrap-break-word">
                {rowData.name}
              </span>
            </div>
            {(rowData.isFixed ||
              rowData.isDeductable ||
              rowData.isCardDelivered) && (
              <div className="flex items-center justify-center gap-x-1 shrink-0">
                {rowData.isCardDelivered && <Badge text="C" />}
                {rowData.isFixed && <Badge text="F" />}
              </div>
            )}
          </div>
        ),
      },
      {
        field: "designation",
        header: "Designation",
        ...tableCommonProps,
        filterable: true,
        filter: true,
        filterElement: (options: any) => (
          <StatusRowFilter dataSource={designationsOptions} options={options} />
        ),
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-sm text-center font-medium!">
              {rowData.designation}
            </span>
          </div>
        ),
      },
      {
        field: "idNumber",
        header: "ID Number",
        ...tableCommonProps,
        filterable: true,
        style: { minWidth: 150 },
        body: (rowData: PayrollDetailEntry) => (
          <span className="text-sm font-medium!">{rowData.idNumber}</span>
        ),
      },
      {
        field: "workDays",
        header: "Work Days",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {rowData.workDays.toString()}
            </span>
          </div>
        ),
      },
      {
        field: "overTime",
        header: "Over Time",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {rowData.overTime}
            </span>
          </div>
        ),
      },
      {
        field: "totalHours",
        header: "Total Hours",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {rowData.totalHours}
            </span>
          </div>
        ),
      },
      {
        field: "hourlyRate",
        header: "Hourly Rate",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.hourlyRate, 2).toString()}
            </span>
          </div>
        ),
      },
      ...(payrollSectionId === 6 || payrollSectionId === 15
        ? [
            {
              field: "tripAllowance",
              header: "Trip Allow.",
              ...tableCommonProps,
              body: (rowData: PayrollDetailEntry) => (
                <div className="flex justify-center">
                  <NumberInput
                    useGrouping={false}
                    disabled={rowData.payrollSummaryStatusId === 3}
                    value={rowData.tripAllowance}
                    onValueChange={(e) =>
                      updatePayrollEntry(
                        rowData.id,
                        "tripAllowance",
                        e.value || 0
                      )
                    }
                    className="timesheet-number-input payroll-input"
                    min={0}
                    showButtons={false}
                  />
                </div>
              ),
            },
            {
              field: "overtimeAllowance",
              header: "OT Allow.",
              ...tableCommonProps,
              body: (rowData: PayrollDetailEntry) => (
                <div className="flex justify-center">
                  <NumberInput
                    useGrouping={false}
                    disabled={rowData.payrollSummaryStatusId === 3}
                    value={rowData.overtimeAllowance}
                    onValueChange={(e) =>
                      updatePayrollEntry(
                        rowData.id,
                        "overtimeAllowance",
                        e.value || 0
                      )
                    }
                    className="timesheet-number-input payroll-input"
                    min={0}
                    showButtons={false}
                  />
                </div>
              ),
            },
          ]
        : [
            {
              field: "breakfastAllowance",
              header: "Brkfst. Allow.",
              ...tableCommonProps,
              body: (rowData: PayrollDetailEntry) => (
                <div className="flex justify-center">
                  <span className="text-[15px] font-semibold!">
                    {formatNum(rowData.breakfastAllowance ?? 0)}
                  </span>
                </div>
              ),
            },
            {
              field: "otherAllowances",
              header: "Other Allow.",
              ...tableCommonProps,
              body: (rowData: PayrollDetailEntry) => (
                <div className="flex justify-center">
                  <span className="text-[15px] font-semibold!">
                    {formatNum(rowData.otherAllowances ?? 0)}
                  </span>
                </div>
              ),
            },
          ]),
      {
        field: "totalAllowances",
        header: "Total Allow.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(calculateTotalAllowances(rowData))}
            </span>
          </div>
        ),
      },
      {
        field: "totalSalary",
        header: "Total Salary",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.totalSalary)}
            </span>
          </div>
        ),
      },
      {
        field: "previousAdvance",
        header: "Prev. Adv.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.previousAdvance)}
            </span>
          </div>
        ),
      },
      {
        field: "currentAdvance",
        header: "Curr. Adv.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.currentAdvance)}
            </span>
          </div>
        ),
      },
      {
        field: "loanDeduction",
        header: "Loan Ded.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <NumberInput
              useGrouping={false}
              disabled={rowData.payrollSummaryStatusId === 3}
              value={rowData.loanDeduction}
              onValueChange={(e) =>
                updatePayrollEntry(rowData.id, "loanDeduction", e.value || 0)
              }
              className="timesheet-number-input payroll-input"
              min={0}
              showButtons={false}
            />
          </div>
        ),
      },
      {
        field: "netLoan",
        header: "Net Loan",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold! text-primary!">
              {formatNum(calculateNetLoan(rowData))}
            </span>
          </div>
        ),
      },
      {
        field: "previousChallan",
        header: "Prev. Traff.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.previousChallan)}
            </span>
          </div>
        ),
      },
      {
        field: "currentChallan",
        header: "Curr. Traff.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.currentChallan)}
            </span>
          </div>
        ),
      },
      {
        field: "challanDeduction",
        header: "Traff. Ded.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <NumberInput
              useGrouping={false}
              disabled={rowData.payrollSummaryStatusId === 3}
              value={rowData.challanDeduction}
              onValueChange={(e) =>
                updatePayrollEntry(rowData.id, "challanDeduction", e.value || 0)
              }
              className="timesheet-number-input payroll-input"
              min={0}
              showButtons={false}
            />
          </div>
        ),
      },
      {
        field: "netChallan",
        header: "Net Traff.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold! text-primary!">
              {formatNum(calculateNetTrafficChallan(rowData))}
            </span>
          </div>
        ),
      },
      {
        field: "netSalaryPayable",
        header: "Net Salary",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold! text-primary!">
              {formatNum(calculateNetSalaryPayable(rowData))}
            </span>
          </div>
        ),
      },
      {
        field: "cardSalary",
        header: "Card Salary",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <NumberInput
              useGrouping={false}
              disabled={rowData.payrollSummaryStatusId === 3}
              value={rowData.cardSalary}
              onValueChange={(e) =>
                updateSalaryPair(rowData.id, "cardSalary", e.value ?? 0)
              }
              className="timesheet-number-input payroll-input"
              min={0}
              showButtons={false}
            />
          </div>
        ),
      },
      {
        field: "cashSalary",
        header: "Cash Salary",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <NumberInput
              useGrouping={false}
              disabled={rowData.payrollSummaryStatusId === 3}
              value={rowData.cashSalary}
              onValueChange={(e) =>
                updateSalaryPair(rowData.id, "cashSalary", e.value ?? 0)
              }
              className="timesheet-number-input payroll-input"
              min={0}
              showButtons={false}
            />
          </div>
        ),
      },
      {
        field: "remarks",
        header: "Remarks",
        ...tableCommonProps,
        filterable: true,
        style: { minWidth: 200 },
        body: (rowData: PayrollDetailEntry) => (
          <Input
            small
            disabled={rowData.payrollSummaryStatusId === 3}
            placeholder="Add remarks"
            value={rowData.remarks}
            onChange={(e) =>
              updatePayrollEntry(rowData.id, "remarks", e.target.value)
            }
            className="w-full h-10! payroll-input"
            onKeyDown={(e: any) => {
              if (e.key === "Enter") {
                const val = e.currentTarget.value;
                handleSaveSingleRowOnEnter(rowData.id, "remarks", val);
                updatePayrollEntry(rowData.id, "remarks", val);
              }
            }}
          />
        ),
      },
      {
        field: "paymentMethodId",
        header: "Salary Method",
        ...tableCommonProps,
        style: { minWidth: 200, width: 200 },
        body: (rowData: PayrollDetailEntry) => (
          <Dropdown
            small
            filter
            options={paymentMethodOptions}
            disabled={rowData.payrollSummaryStatusId === 3}
            className="w-[200px]! h-10!"
            placeholder="Choose Method"
            value={rowData.paymentMethodId?.toString()}
            onChange={(e) =>
              updatePayrollEntry(
                rowData.id,
                "paymentMethodId",
                e.value ? Number(e.value) : null
              )
            }
          />
        ),
      },
      {
        field: "payrollStatusId",
        header: "Status",
        ...tableCommonProps,
        style: { minWidth: 150, width: 150 },
        body: (rowData: PayrollDetailEntry) => (
          <Dropdown
            small
            options={statusOptions.slice(0, 2)}
            disabled={rowData.payrollSummaryStatusId === 3}
            className="w-[150px]! h-10!"
            placeholder="Pending"
            value={rowData.payrollStatusId}
            onChange={(e) =>
              updatePayrollEntry(rowData.id, "payrollStatusId", e.value)
            }
          />
        ),
      },
      {
        field: "id",
        header: "Actions",
        ...tableCommonProps,
        sortable: false,
        filterable: false,
        style: { minWidth: 80, width: 80, textAlign: "center" },
        body: (rowData: PayrollDetailEntry) => (
          <ActionButtons
            rowData={rowData}
            isSavingAll={isSavingAll}
            onRefreshComplete={handleRowRefreshComplete}
          />
        ),
      },
    ],
    [
      payrollData,
      isSavingAll,
      isSavingRow,
      isLoading,
      statusOptions,
      paymentMethodOptions,
      updatePayrollEntry,
      updateSalaryPair,
      handleSaveSingleRowOnEnter,
      handleRowRefreshComplete,
    ]
  );
};
