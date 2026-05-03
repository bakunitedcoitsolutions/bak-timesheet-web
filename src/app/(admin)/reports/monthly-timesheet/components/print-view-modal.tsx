"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { classNames } from "primereact/utils";

import { EmployeeMonthlyReport } from "@/lib/db/services/timesheet/timesheet.dto";

interface PrintViewModalProps {
  year: number;
  visible: boolean;
  monthName: string;
  onHide: () => void;
  reports: EmployeeMonthlyReport[];
}

export const PrintViewModal = ({
  visible,
  onHide,
  reports,
}: PrintViewModalProps) => {
  const [zoom, setZoom] = useState(0.7);

  useEffect(() => {
    const handleResize = () => {
      setZoom(window.innerWidth < 786 ? 0.5 : 0.7);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Dialog
      modal
      maximizable
      footer={null}
      onHide={onHide}
      header="Preview"
      visible={visible}
      contentClassName="bg-gray-200 p-3!"
      style={{ width: "98vw", maxWidth: "1100px" }}
      headerClassName="p-4! border-gray-100! border-b!"
      pt={{
        headerTitle: {
          className: "text-base!",
        },
      }}
    >
      <div style={{ zoom }}>
        {reports.map((report, idx) => {
          const p1Hrs = report.dailyRecords.reduce(
            (s, r) => s + (r.project1Hours || 0),
            0
          );
          const p1OT = report.dailyRecords.reduce(
            (s, r) => s + (r.project1Overtime || 0),
            0
          );
          const p2Hrs = report.dailyRecords.reduce(
            (s, r) => s + (r.project2Hours || 0),
            0
          );
          const p2OT = report.dailyRecords.reduce(
            (s, r) => s + (r.project2Overtime || 0),
            0
          );
          const grandTotal = p1Hrs + p1OT + p2Hrs + p2OT;

          return (
            <div
              key={report.employeeCode}
              className={classNames({
                "mb-12 pt-12": idx > 0,
                "pt-5": idx === 1,
              })}
            >
              <div className="bg-gray-50 p-2 w-full border border-gray-300 border-b-0 flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="font-bold text-primary-700 flex items-center gap-2">
                    <span className="text-base">
                      {report.employeeCode} - {report.nameEn}
                    </span>
                    {report.isFixed && (
                      <span className="px-1.5 py-0.5 bg-gray-200 rounded text-[9px] font-bold uppercase">
                        Fixed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    {report.designationName || "No Designation"}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    ID Card No
                  </div>
                  <div className="font-mono text-xs bg-white py-0.5 rounded">
                    {report.idCardNo || "N/A"}
                  </div>
                </div>
              </div>
              <table className="w-full border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 w-10 text-center">
                      #
                    </th>
                    <th className="border border-gray-300 p-2 w-28 text-center">
                      Date
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Project 1
                    </th>
                    <th className="border border-gray-300 p-2 w-14 text-center">
                      Hrs
                    </th>
                    <th className="border border-gray-300 p-2 w-14 text-center">
                      OT
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Project 2
                    </th>
                    <th className="border border-gray-300 p-2 w-14 text-center">
                      Hrs
                    </th>
                    <th className="border border-gray-300 p-2 w-14 text-center">
                      OT
                    </th>
                    <th className="border border-gray-300 p-2 w-20 text-center">
                      Total
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.dailyRecords.map((record) => (
                    <tr key={record.date} className="even:bg-gray-50/50">
                      <td className="border border-gray-300 p-1.5 text-center">
                        {record.day}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-center font-medium">
                        {record.date}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-left truncate max-w-[150px]">
                        {record.project1Name || "-"}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-center font-medium">
                        {record.project1Hours || 0}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-center text-blue-600 font-bold">
                        {record.project1Overtime || 0}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-left truncate max-w-[150px]">
                        {record.project2Name || "-"}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-center font-medium">
                        {record.project2Hours || 0}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-center text-blue-600 font-bold">
                        {record.project2Overtime || 0}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-center font-extrabold bg-gray-50">
                        {record.project1Hours +
                          record.project1Overtime +
                          record.project2Hours +
                          record.project2Overtime}
                      </td>
                      <td className="border border-gray-300 p-1.5 text-left italic text-gray-600 truncate max-w-[100px]">
                        {record.remarks || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold text-sm">
                    <td
                      colSpan={3}
                      className="border border-gray-300 p-2 text-center uppercase tracking-wider"
                    >
                      Grand Totals
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {p1Hrs}
                    </td>
                    <td className="border border-gray-300 p-2 text-center text-blue-700">
                      {p1OT}
                    </td>
                    <td className="border border-gray-300 p-2 text-center text-gray-400 font-normal">
                      -
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {p2Hrs}
                    </td>
                    <td className="border border-gray-300 p-2 text-center text-blue-700">
                      {p2OT}
                    </td>
                    <td className="border border-gray-300 p-2 text-center bg-gray-200 font-black text-primary-800">
                      {grandTotal}
                    </td>
                    <td className="border border-gray-300 p-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
};
