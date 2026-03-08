"use client";

import React from "react";
import { useAccess } from "@/components";
import {
  NormalDashboard,
  AccessEnabledDashboard,
} from "@/components/custom/home";
import { USER_ROLES } from "@/utils/user.utility";

const HomePage = () => {
  const { role, isLoading } = useAccess();

  // Show nothing while checking access to avoid layout shifts
  if (isLoading) return null;

  if (Number(role) === USER_ROLES.ACCESS_ENABLED) {
    return <AccessEnabledDashboard />;
  }

  return <NormalDashboard />;
};

export default HomePage;
