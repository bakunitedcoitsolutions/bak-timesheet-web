"use client";

import {
  NormalDashboard,
  AccessEnabledDashboard,
} from "@/components/custom/home";
import { useAccess } from "@/components";
import { USER_ROLES } from "@/utils/user.utility";

const HomePage = () => {
  const { role, isLoading } = useAccess();

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="custom-loader"></div>
      </div>
    );

  if (
    Number(role) === USER_ROLES.ACCESS_ENABLED ||
    Number(role) === USER_ROLES.BRANCH_USER
  ) {
    return <AccessEnabledDashboard />;
  }

  return <NormalDashboard />;
};

export default HomePage;
