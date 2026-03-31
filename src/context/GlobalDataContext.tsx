"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import { getGlobalDataAction } from "@/lib/db/services/shared/actions";
import { useAccess } from "@/components/common";

export interface GlobalDataCity {
  id: number;
  nameEn: string;
  countryId: number;
}

export interface GlobalDataGeneral {
  id: number;
  nameEn: string;
  branchId?: number | null;
  displayOrderKey?: number | null;
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
  }, []);

  const { isBranchScoped, branchId: userBranchId } = useAccess();

  const filteredData = useMemo(() => {
    if (isBranchScoped && userBranchId) {
      return {
        ...data,
        payrollSections: data?.payrollSections?.filter?.(
          (section) => section.branchId === userBranchId
        ),
      };
    }
    return data;
  }, [data, isBranchScoped, userBranchId]);

  const value = useMemo(
    () => ({ data: filteredData, isLoading, refresh: fetchData }),
    [filteredData, isLoading, fetchData]
  );

  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  );
};
