"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getGlobalDataAction } from "@/lib/db/services/shared/actions";

export interface GlobalDataCity {
  id: number;
  nameEn: string;
  countryId: number;
}

export interface GlobalDataGeneral {
  id: number;
  nameEn: string;
}

export interface GlobalDataEmployee {
  id: number;
  employeeCode: number;
  designationId: number;
  nameEn: string;
}

export interface GlobalDataDesignation {
  id: number;
  nameEn: string;
  hoursPerDay: number;
}

export interface GlobalDataUserPrivilege {
  id: number;
  userId: number;
  privileges: any;
}

export interface GlobalData {
  designations: GlobalDataDesignation[];
  employees: GlobalDataEmployee[];
  projects: GlobalDataGeneral[];
  payrollSections: GlobalDataGeneral[];
  payrollStatuses: GlobalDataGeneral[];
  userRoles: GlobalDataGeneral[];
  userPrivileges: GlobalDataUserPrivilege[];
  branches: GlobalDataGeneral[];
  cities: GlobalDataCity[];
  countries: GlobalDataGeneral[];
  gosiCities: GlobalDataGeneral[];
  employeeStatuses: GlobalDataGeneral[];
  paymentMethods: GlobalDataGeneral[];
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
  const [data, setData] = React.useState<GlobalData>(initialData);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = React.useMemo(
    () => ({ data, isLoading, refresh: fetchData }),
    [data, isLoading, fetchData]
  );

  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  );
};
