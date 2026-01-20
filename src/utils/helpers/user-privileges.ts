import React from "react";
import { UserPrivileges, FeaturePermissions, ReportsPrivileges } from "@/utils/dummy";
import { FEATURES_CONFIG } from "@/utils/constants/permissions";
import { REPORT_OPTIONS } from "@/utils/constants/reports";

/**
 * Check if a feature section is enabled (exists in privileges)
 * For features with only "full" permission, check if "full" is true
 * For other features, check if feature exists in privileges
 */
export const isFeatureEnabled = (
  featureKey: keyof UserPrivileges,
  privileges: UserPrivileges
): boolean => {
  const featurePrivileges = privileges[featureKey];
  if (!featurePrivileges) return false;

  const featureConfig = FEATURES_CONFIG.find((f) => f.key === featureKey);
  if (!featureConfig) return false;

  // If feature only has "full" permission, check if "full" is true
  const hasOnlyFull =
    featureConfig.permissions.length === 1 &&
    featureConfig.permissions[0].key === "full";

  if (hasOnlyFull) {
    return featurePrivileges.full === true;
  }

  // For other features, check if any permission is enabled
  return true;
};

/**
 * Handle section-level toggle (enable/disable entire feature)
 */
export const handleFeatureToggle = (
  featureKey: keyof UserPrivileges,
  enabled: boolean,
  setPrivileges: React.Dispatch<React.SetStateAction<UserPrivileges>>
) => {
  setPrivileges((prev) => {
    const updated = { ...prev };
    if (enabled) {
      // Get the feature config to know which permissions are available
      const featureConfig = FEATURES_CONFIG.find((f) => f.key === featureKey);
      if (!featureConfig) return updated;

      // Get all individual permission keys (excluding "full")
      const individualPermissionKeys = featureConfig.permissions
        .filter((p) => p.key !== "full")
        .map((p) => p.key) as Array<keyof FeaturePermissions>;

      // Special handling for Reports feature
      if (featureKey === "reports") {
        // Initialize all reports with enabled=true and all filter options enabled
        const reportsPrivileges: ReportsPrivileges = {
          full: true,
          add: false,
          edit: false,
          view: false,
          reports: REPORT_OPTIONS.map((report) => ({
            reportId: report.id,
            enabled: true,
            filters: report.filterOptions?.map((filter) => ({
              key: filter.key,
              enabled: true,
            })) || [],
          })),
        };
        updated[featureKey] = reportsPrivileges;
      } else {
        // Enable section - set "full" to true by default, which enables all available permissions
        const fullPermissions: FeaturePermissions = {
          full: true,
          add: false,
          edit: false,
          view: false,
        };

        // Set only the permissions that are available for this feature
        individualPermissionKeys.forEach((key) => {
          fullPermissions[key] = true;
        });

        updated[featureKey] = fullPermissions;
      }
    } else {
      // Disable section - remove the feature from privileges
      delete updated[featureKey];
    }
    return updated;
  });
};

/**
 * Handle privilege change for individual permissions
 */
export const handlePrivilegeChange = (
  featureKey: keyof UserPrivileges,
  permissionKey: keyof FeaturePermissions,
  checked: boolean,
  setPrivileges: React.Dispatch<React.SetStateAction<UserPrivileges>>
) => {
  setPrivileges((prev) => {
    const updated = { ...prev };
    if (!updated[featureKey]) {
      updated[featureKey] = {
        full: false,
        add: false,
        edit: false,
        view: false,
      };
    }

    const currentPermissions = updated[featureKey]!;

    // Get the feature config to know which permissions are available
    const featureConfig = FEATURES_CONFIG.find((f) => f.key === featureKey);
    if (!featureConfig) return updated;

    // Get all individual permission keys (excluding "full")
    const individualPermissionKeys = featureConfig.permissions
      .filter((p) => p.key !== "full")
      .map((p) => p.key) as Array<keyof FeaturePermissions>;

    // If "Full Access" is checked, set all available permissions to true
    if (permissionKey === "full" && checked) {
      const fullPermissions: FeaturePermissions = {
        full: true,
        add: false,
        edit: false,
        view: false,
      };

      // Set only the permissions that are available for this feature
      individualPermissionKeys.forEach((key) => {
        fullPermissions[key] = true;
      });

      updated[featureKey] = fullPermissions;
    }
    // If "Full Access" is unchecked, keep other permissions as they are
    // If any other permission is changed, update "Full Access" accordingly
    else {
      // First, update the permission that was changed
      const newPermissions = {
        ...currentPermissions,
        [permissionKey]: checked,
      };

      // If an individual permission was changed
      if (permissionKey !== "full") {
        // If any individual permission is unchecked, uncheck "Full Access"
        if (!checked) {
          newPermissions.full = false;
        } else {
          // If an individual permission is checked, check if all available individual permissions are selected
          // If all available individual permissions are true, automatically check "Full Access"
          const allIndividualSelected = individualPermissionKeys.every(
            (key) => newPermissions[key] === true
          );
          newPermissions.full = allIndividualSelected;
        }
      }

      updated[featureKey] = newPermissions;
    }

    return updated;
  });
};

/**
 * Handle report toggle (enable/disable individual report)
 */
export const handleReportToggle = (
  reportId: string,
  enabled: boolean,
  setPrivileges: React.Dispatch<React.SetStateAction<UserPrivileges>>
) => {
  setPrivileges((prev) => {
    const updated = { ...prev };
    if (!updated.reports) {
      updated.reports = {
        full: true,
        add: false,
        edit: false,
        view: false,
        reports: [],
      };
    }

    const reportsPrivileges = updated.reports as ReportsPrivileges;
    if (!reportsPrivileges.reports) {
      reportsPrivileges.reports = [];
    }

    const existingReportIndex = reportsPrivileges.reports.findIndex(
      (r) => r.reportId === reportId
    );

    const reportConfig = REPORT_OPTIONS.find((r) => r.id === reportId);

    if (enabled) {
      if (existingReportIndex === -1) {
        // Add new report with all filters enabled
        reportsPrivileges.reports.push({
          reportId,
          enabled: true,
          filters:
            reportConfig?.filterOptions?.map((filter) => ({
              key: filter.key,
              enabled: true,
            })) || [],
        });
      } else {
        // Enable existing report and ensure filters are initialized
        const existingReport = reportsPrivileges.reports[existingReportIndex];
        existingReport.enabled = true;

        // Initialize filters if they don't exist or are missing
        if (!existingReport.filters || existingReport.filters.length === 0) {
          existingReport.filters =
            reportConfig?.filterOptions?.map((filter) => ({
              key: filter.key,
              enabled: true,
            })) || [];
        } else {
          // Ensure all filter options from config exist, add missing ones and enable them
          reportConfig?.filterOptions?.forEach((filterOption) => {
            const filterIndex = existingReport.filters?.findIndex(
              (f) => f.key === filterOption.key
            );
            if (filterIndex === -1 || filterIndex === undefined) {
              // Add missing filter
              existingReport.filters?.push({
                key: filterOption.key,
                enabled: true,
              });
            } else if (filterIndex !== undefined && existingReport.filters) {
              // Ensure existing filter is enabled when report is enabled
              existingReport.filters[filterIndex].enabled = true;
            }
          });
        }
      }
    } else {
      if (existingReportIndex !== -1) {
        reportsPrivileges.reports[existingReportIndex].enabled = false;
        // Disable all filters when report is disabled
        if (reportsPrivileges.reports[existingReportIndex].filters) {
          reportsPrivileges.reports[existingReportIndex].filters.forEach(
            (filter) => {
              filter.enabled = false;
            }
          );
        }
      }
    }

    return updated;
  });
};

/**
 * Handle report filter toggle (enable/disable a specific filter option for a report)
 */
export const handleReportFilterToggle = (
  reportId: string,
  filterKey: string,
  enabled: boolean,
  setPrivileges: React.Dispatch<React.SetStateAction<UserPrivileges>>
) => {
  setPrivileges((prev) => {
    const updated = { ...prev };
    if (!updated.reports) {
      // If reports section doesn't exist, initialize it
      updated.reports = {
        full: true,
        add: false,
        edit: false,
        view: false,
        reports: [],
      };
    }

    const reportsPrivileges = updated.reports as ReportsPrivileges;
    if (!reportsPrivileges.reports) {
      reportsPrivileges.reports = [];
    }

    const reportIndex = reportsPrivileges.reports.findIndex(
      (r) => r.reportId === reportId
    );
    const reportConfig = REPORT_OPTIONS.find((r) => r.id === reportId);

    if (reportIndex !== -1) {
      // Report exists
      const report = reportsPrivileges.reports[reportIndex];

      // Ensure filters array exists
      if (!report.filters) {
        report.filters = [];
      }

      const filterIndex = report.filters.findIndex(
        (f) => f.key === filterKey
      );

      if (filterIndex !== -1) {
        // Update existing filter
        report.filters[filterIndex].enabled = enabled;
      } else {
        // Add new filter if it doesn't exist
        const filterOption = reportConfig?.filterOptions?.find(
          (f) => f.key === filterKey
        );
        if (filterOption) {
          report.filters.push({
            key: filterKey,
            enabled: enabled,
          });
        }
      }
    } else {
      // Report doesn't exist, create it with the filter
      const filterOption = reportConfig?.filterOptions?.find(
        (f) => f.key === filterKey
      );
      if (reportConfig && filterOption) {
        reportsPrivileges.reports.push({
          reportId,
          enabled: true,
          filters: [
            {
              key: filterKey,
              enabled: enabled,
            },
          ],
        });
      }
    }

    return updated;
  });
};
