import { TimesheetPageRow } from "@/lib/db/services/timesheet/timesheet.dto";
import { USER_ROLES } from "@/utils/user.utility";

/** Today's date in YYYY-MM-DD */
export const getTodayDateString = () => new Date().toISOString().slice(0, 10);

/**
 * Checks if a timesheet row is locked for editing based on payroll status and user permissions.
 */
export const isLocked = (
  rowData: TimesheetPageRow,
  isPayrollPosted: boolean,
  role: number | null | undefined,
  hasFull: boolean,
  canEdit: boolean,
  canAdd: boolean
) => {
  if (isPayrollPosted) return true;
  if (role === USER_ROLES.ACCESS_ENABLED && hasFull) return false;
  if (role === USER_ROLES.ACCESS_ENABLED && !canEdit && rowData.timesheetId) return true;
  if (role === USER_ROLES.ACCESS_ENABLED && !canAdd && !rowData.timesheetId) return true;
  return false;
};
