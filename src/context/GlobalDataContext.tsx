"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getGlobalDataAction } from "@/lib/db/services/shared/actions";

export interface GlobalData {
  designations: { id: number; nameEn: string }[];
  employees: { id: number; employeeCode: number; nameEn: string }[];
  projects: { id: number; nameEn: string }[];
  payrollSections: { id: number; nameEn: string }[];
  payrollStatuses: { id: number; nameEn: string }[];
  userRoles: { id: number; nameEn: string }[];
  userPrivileges: { id: number; userId: number; privileges: any }[];
  branches: { id: number; nameEn: string }[];
  cities: { id: number; nameEn: string }[];
  countries: { id: number; nameEn: string }[];
  gosiCities: { id: number; nameEn: string }[];
  employeeStatuses: { id: number; nameEn: string }[];
  paymentMethods: { id: number; nameEn: string }[];
}

interface GlobalDataContextType {
  data: GlobalData;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const initialData: GlobalData = {
  designations: [],
  employees: [],
  projects: [],
  payrollSections: [],
  payrollStatuses: [],
  userRoles: [],
  userPrivileges: [],
  branches: [],
  cities: [],
  countries: [],
  gosiCities: [],
  employeeStatuses: [],
  paymentMethods: [],
};

const GlobalDataContext = createContext<GlobalDataContextType>({
  data: initialData,
  isLoading: true,
  refresh: async () => {},
});

export const useGlobalData = () => useContext(GlobalDataContext);

export const GlobalDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [data, setData] = useState<GlobalData>(initialData);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [data, err] = await getGlobalDataAction({});
      if (err) {
        console.error("Failed to fetch global data:", err);
        return;
      }
      if (data) {
        setData(data);
      }
    } catch (error) {
      console.error("Failed to fetch global data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <GlobalDataContext.Provider value={{ data, isLoading, refresh: fetchData }}>
      {children}
    </GlobalDataContext.Provider>
  );
};
