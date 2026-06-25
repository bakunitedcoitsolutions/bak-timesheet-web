import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { Badge } from "primereact/badge";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import type { BulkUploadTimesheetResult } from "@/lib/db/services/timesheet/timesheet.dto";
import type { BulkUploadLoanResult } from "@/lib/db/services/loan/loan.dto";
import type { BulkUploadTrafficChallanResult } from "@/lib/db/services/traffic-challan/traffic-challan.dto";
import type { BulkUploadPayrollAllowanceResult } from "@/lib/db/services/payroll-summary/payroll-allowance-bulk-upload.dto";

interface BulkUploadReportDialogProps {
  visible: boolean;
  onHide: () => void;
  result: BulkUploadTimesheetResult | BulkUploadLoanResult | BulkUploadTrafficChallanResult | BulkUploadPayrollAllowanceResult | null;
  fileName?: string;
}

export const BulkUploadReportDialog = ({
  visible,
  onHide,
  result,
  fileName,
}: BulkUploadReportDialogProps) => {
  if (!result) return null;

  // Check if any detail rows have a date field (payroll allowance uploads don't)
  const hasDateColumn = result.details.some((d: any) => d.date !== undefined);

  const statusBodyTemplate = (rowData: any) => {
    return (
      <Badge
        value={rowData.status.toUpperCase()}
        severity={
          rowData.status === "success"
            ? "success"
            : rowData.status === "skipped"
              ? "warning"
              : "danger"
        }
      />
    );
  };

  const dateBodyTemplate = (rowData: any) => {
    return dayjs(rowData.date).format("DD MMMM, YYYY");
  };

  const handleDownload = () => {
    if (!result.details || result.details.length === 0) return;

    const dataToExport = result.details.map((row: any) => {
      const exportRow: any = {
        "Row #": row.row,
        "Emp Code": row.employeeCode,
      };
      if (hasDateColumn) {
        exportRow["Date"] = row.date ? dayjs(row.date).format("YYYY-MM-DD") : "";
      }
      exportRow["Status"] = row.status.toUpperCase();
      exportRow["Message"] = row.message || "";
      return exportRow;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Upload Report");

    const exportFileName = fileName
      ? `Bulk_Upload_Report_${fileName.replace(/\.[^/.]+$/, "")}_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`
      : `Bulk_Upload_Report_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`;

    XLSX.writeFile(wb, exportFileName);
  };

  const header = (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xl font-bold">Upload Report</span>
        {fileName && (
          <span className="text-sm text-gray-500 font-normal border border-gray-300 rounded px-2 py-1 bg-gray-50">
            File:{" "}
            <span className="font-semibold text-gray-700">{fileName}</span>
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Badge value={`Total: ${result.details.length}`} severity="info" />
        <Badge value={`Success: ${result.success}`} severity="success" />
        <Badge value={`Skipped: ${result.skipped}`} severity="warning" />
        <Badge value={`Failed: ${result.failed}`} severity="danger" />
      </div>
    </div>
  );

  const footer = (
    <div className="flex gap-2 justify-end">
      <Button
        size="small"
        label="Download Report"
        icon="pi pi-download"
        severity="success"
        onClick={handleDownload}
        outlined
      />
      <Button
        label="Close"
        size="small"
        icon="pi pi-check"
        onClick={onHide}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "75vw" }}
      header={header}
      modal
      className="p-fluid"
      footer={footer}
      onHide={onHide}
    >
      <DataTable
        value={result.details}
        paginator
        rows={25}
        rowsPerPageOptions={[25, 50, 100]}
        sortField="row"
        sortOrder={1}
        className="p-datatable-sm"
        stripedRows
      >
        <Column
          field="row"
          header="Row #"
          sortable
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="employeeCode"
          header="Emp Code"
          sortable
          style={{ minWidth: "8rem" }}
        />
        {hasDateColumn && (
          <Column
            field="date"
            header="Date"
            sortable
            body={dateBodyTemplate}
            style={{ minWidth: "8rem" }}
          />
        )}
        <Column
          field="status"
          header="Status"
          sortable
          body={statusBodyTemplate}
          style={{ minWidth: "8rem" }}
        />
        <Column field="message" header="Message" sortable />
      </DataTable>
    </Dialog>
  );
};
