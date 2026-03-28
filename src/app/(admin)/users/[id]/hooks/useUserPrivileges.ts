import { useState, useCallback } from "react";
import {
  UserPrivileges,
  FeaturePermissions,
} from "@/utils/user.utility";
import {
  handleReportToggle as toggleReport,
  handleFeatureToggle as toggleFeature,
  isFeatureEnabled as checkFeatureEnabled,
  handlePrivilegeChange as changePrivilege,
  handleReportFilterToggle as toggleReportFilter,
} from "@/utils/helpers/user-privileges";

export const useUserPrivileges = (initialPrivileges: UserPrivileges = {}) => {
  const [privileges, setPrivileges] = useState<UserPrivileges>(initialPrivileges);

  const isFeatureEnabled = useCallback((featureKey: keyof UserPrivileges): boolean => {
    return checkFeatureEnabled(featureKey, privileges);
  }, [privileges]);

  const handleFeatureToggle = useCallback((
    featureKey: keyof UserPrivileges,
    enabled: boolean
  ) => {
    toggleFeature(featureKey, enabled, setPrivileges);
  }, []);

  const handlePrivilegeChange = useCallback((
    featureKey: keyof UserPrivileges,
    permissionKey: keyof FeaturePermissions,
    checked: boolean
  ) => {
    changePrivilege(featureKey, permissionKey, checked, setPrivileges);
  }, []);

  const handleReportToggle = useCallback((reportId: string, enabled: boolean) => {
    toggleReport(reportId, enabled, setPrivileges);
  }, []);

  const handleReportFilterToggle = useCallback((
    reportId: string,
    filterKey: string,
    enabled: boolean
  ) => {
    toggleReportFilter(reportId, filterKey, enabled, setPrivileges);
  }, []);

  return {
    privileges,
    setPrivileges,
    isFeatureEnabled,
    handleFeatureToggle,
    handlePrivilegeChange,
    handleReportToggle,
    handleReportFilterToggle,
  };
};
