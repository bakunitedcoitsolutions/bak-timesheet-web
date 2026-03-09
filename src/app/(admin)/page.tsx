"use client";

import { useAccess } from "@/components";
import {
  NormalDashboard,
  AccessEnabledDashboard,
} from "@/components/custom/home";
import { USER_ROLES } from "@/utils/user.utility";

const HomePage = () => {
  const { role, isLoading } = useAccess();

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="custom-loader"></div>
      </div>
    );

  if (Number(role) === USER_ROLES.ACCESS_ENABLED) {
    return <AccessEnabledDashboard />;
  }

  return <NormalDashboard />;
};

export default HomePage;

const a = {
  loans: {
    add: true,
    edit: false,
    full: false,
    view: true,
  },
  reports: {
    add: false,
    edit: false,
    full: true,
    view: false,
    items: [
      {
        enabled: true,
        filters: [
          {
            key: "enableAllFilters",
            enabled: false,
          },
        ],
        reportId: "salary-slips",
      },
      {
        enabled: true,
        filters: [
          {
            key: "enableAllFilters",
            enabled: false,
          },
        ],
        reportId: "daily-timesheet",
      },
      {
        enabled: true,
        filters: [
          {
            key: "enableAllFilters",
            enabled: true,
          },
        ],
        reportId: "monthly-timesheet",
      },
      {
        enabled: false,
        filters: [
          {
            key: "enableAllFilters",
            enabled: false,
          },
        ],
        reportId: "employees",
      },
      {
        enabled: false,
        filters: [
          {
            key: "enableAllFilters",
            enabled: false,
          },
        ],
        reportId: "employee-leave-statement",
      },
      {
        enabled: true,
        filters: [
          {
            key: "enableAllFilters",
            enabled: true,
          },
        ],
        reportId: "employee-cards",
      },
    ],
  },
  trafficViolations: {
    add: true,
    edit: false,
    full: false,
    view: true,
  },
};
