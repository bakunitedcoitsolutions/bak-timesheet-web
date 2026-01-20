import { Checkbox } from "@/components/forms";
import { classNames } from "primereact/utils";

import { ReportsPrivileges } from "@/utils/dummy";
import { FORM_FIELD_WIDTHS, REPORT_OPTIONS } from "@/utils/constants";

interface ReportsSectionProps {
  privileges: ReportsPrivileges | undefined;
  handleReportToggle: (reportId: string, enabled: boolean) => void;
  handleReportFilterToggle: (
    reportId: string,
    filterKey: string,
    enabled: boolean
  ) => void;
}

const ReportsSection = ({
  privileges,
  handleReportToggle,
  handleReportFilterToggle,
}: ReportsSectionProps) => {
  return (
    <div className={classNames(FORM_FIELD_WIDTHS["full"], "md:col-span-2")}>
      <div className="rounded-lg p-6 bg-primary-light/50">
        <h3 className="text-lg font-semibold text-primary mb-4">Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REPORT_OPTIONS.map((report) => {
            const reportPermission = privileges?.reports?.find(
              (r) => r.reportId === report.id
            );
            const isReportEnabled = reportPermission?.enabled || false;
            const reportFilters = reportPermission?.filters || [];

            return (
              <div
                key={report.id}
                className="border border-primary/50 rounded-lg p-4 bg-white"
              >
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <Checkbox
                    label={report.title}
                    checked={isReportEnabled}
                    onChange={(checked) =>
                      handleReportToggle(report.id, checked)
                    }
                    name={`report-${report.id}-section`}
                    className="font-semibold"
                    labelClassName="text-base font-semibold"
                  />
                </div>
                {isReportEnabled &&
                  report.filterOptions &&
                  report.filterOptions.length > 0 && (
                    <div className="flex flex-col gap-4 pl-6">
                      {report.filterOptions.map((filterOption) => {
                        // Find the filter in the report's filters array
                        const filter = reportFilters.find(
                          (f) => f.key === filterOption.key
                        );
                        // If filter exists, use its enabled state, otherwise default to true if report is enabled
                        // This ensures filters show as enabled when report is first enabled
                        const isFilterEnabled = filter
                          ? filter.enabled
                          : isReportEnabled
                            ? true
                            : false;

                        return (
                          <Checkbox
                            key={filterOption.key}
                            label={filterOption.label}
                            checked={isFilterEnabled}
                            onChange={(checked) =>
                              handleReportFilterToggle(
                                report.id,
                                filterOption.key,
                                checked
                              )
                            }
                            name={`report-${report.id}-${filterOption.key}`}
                          />
                        );
                      })}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;
