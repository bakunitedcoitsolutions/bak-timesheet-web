import { TableColumn } from "@/components";

/**
 * Defines the columns for the leave eligibility report table
 */
export const getLeaveEligibilityTableColumns = (): TableColumn<any>[] => {
  return [
    {
      field: "index",
      header: "#",
      sortable: false,
      filterable: false,
      style: { minWidth: 50, width: 50 },
      align: "center",
      body: (rowData: any) => (
        <span className="text-sm font-medium text-gray-500">
          {rowData.index}
        </span>
      ),
    },
    {
      field: "month",
      header: "Month",
      sortable: false,
      filterable: false,
      align: "left",
      style: { minWidth: 200 },
      body: (rowData: any) => (
        <span className="font-medium text-sm text-gray-500">
          {rowData.month}
        </span>
      ),
    },
    {
      field: "workingDays",
      header: "Work Days",
      sortable: false,
      filterable: false,
      align: "center",
      style: { minWidth: 150, width: 150 },
      body: (rowData: any) => (
        <span className="font-semibold text-primary">
          {rowData.workingDays}
        </span>
      ),
    },
  ];
};
