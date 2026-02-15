"use server";
import { prisma } from "@/lib/db/prisma";
import { serverAction } from "@/lib/zsa/zsa-action";
import { z } from "zod";
import { cache } from "@/lib/redis"; // Import cache helper

import { CACHE_KEYS, GLOBAL_DATA_CACHE_TTL } from "./constants";

// Helper to fetch and cache
const getOrFetch = async <T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> => {
  try {
    const cached = await cache.get<T>(key);
    if (cached) return cached;
  } catch (error) {
    console.error(`Cache get error for ${key}`, error);
  }

  const data = await fetcher();

  try {
    await cache.set(key, data, GLOBAL_DATA_CACHE_TTL);
  } catch (error) {
    console.error(`Cache set error for ${key}`, error);
  }

  return data;
};

// 1. Employees Action
export const getSharedEmployeesAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    return getOrFetch(CACHE_KEYS.EMPLOYEES, () =>
      prisma.employee.findMany({
        select: {
          id: true,
          employeeCode: true,
          nameEn: true,
          designationId: true,
        },
        where: { statusId: 1 },
        orderBy: { employeeCode: "asc" },
      })
    );
  });

// 2. Designations Action
export const getSharedDesignationsAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    return getOrFetch(CACHE_KEYS.DESIGNATIONS, () =>
      prisma.designation.findMany({
        select: {
          id: true,
          nameEn: true,
          hoursPerDay: true,
          displayOrderKey: true,
        },
        where: { isActive: true },
        orderBy: { displayOrderKey: "asc" },
      })
    );
  });

// 3. Projects Action
export const getSharedProjectsAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    return getOrFetch(CACHE_KEYS.PROJECTS, () =>
      prisma.project.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { nameEn: "asc" },
      })
    );
  });

// 4. Payroll Sections Action
export const getSharedPayrollSectionsAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    return getOrFetch(CACHE_KEYS.PAYROLL_SECTIONS, () =>
      prisma.payrollSection.findMany({
        select: { id: true, nameEn: true, displayOrderKey: true },
        where: { isActive: true },
        orderBy: { displayOrderKey: "asc" },
      })
    );
  });

// 5. Payroll Statuses Action
export const getSharedPayrollStatusesAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    return getOrFetch(CACHE_KEYS.PAYROLL_STATUSES, () =>
      prisma.payrollStatus.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { id: "asc" },
      })
    );
  });

// 6. User Roles Action
export const getSharedUserRolesAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    return getOrFetch(CACHE_KEYS.USER_ROLES, () =>
      prisma.userRole.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { id: "asc" },
      })
    );
  });

// 7. User Privileges Action
export const getSharedUserPrivilegesAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    return getOrFetch(CACHE_KEYS.USER_PRIVILEGES, () =>
      prisma.userPrivilege.findMany({
        select: { id: true, userId: true, privileges: true },
      })
    );
  });

// 8. Branches Action
export const getSharedBranchesAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    return getOrFetch(CACHE_KEYS.BRANCHES, () =>
      prisma.branch.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { nameEn: "asc" },
      })
    );
  });

// 9. Cities Action
export const getSharedCitiesAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    return getOrFetch(CACHE_KEYS.CITIES, () =>
      prisma.city.findMany({
        select: { id: true, nameEn: true, countryId: true },
        where: { isActive: true },
        orderBy: { nameEn: "asc" },
      })
    );
  });

// 10. Countries Action
export const getSharedCountriesAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    return getOrFetch(CACHE_KEYS.COUNTRIES, () =>
      prisma.country.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { nameEn: "asc" },
      })
    );
  });

// 11. Gosi Cities Action
export const getSharedGosiCitiesAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    return getOrFetch(CACHE_KEYS.GOSI_CITIES, () =>
      prisma.gosiCity.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { nameEn: "asc" },
      })
    );
  });

// 12. Employee Statuses Action
export const getSharedEmployeeStatusesAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    return getOrFetch(CACHE_KEYS.EMPLOYEE_STATUSES, () =>
      prisma.employeeStatus.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { id: "asc" },
      })
    );
  });

// 13. Payment Methods Action
export const getSharedPaymentMethodsAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    return getOrFetch(CACHE_KEYS.PAYMENT_METHODS, () =>
      prisma.paymentMethod.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { id: "asc" },
      })
    );
  });

export const getGlobalDataAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    // Execute all individual actions in parallel
    // Note: We are calling the handler logic directly or invoking the action.
    // Since we are server-side, we can just call the logic if we extract it,
    // but here we are calling the actions.
    // Optimally, we should extract the logic to Avoiding overhead of action wrappers if called internally,
    // but for now, we will call them via Promise.all on the handlers if possible or just use the logic.
    // However, ZSA actions are callable.

    const results = await Promise.allSettled([
      getSharedEmployeesAction(),
      getSharedDesignationsAction(),
      getSharedProjectsAction(),
      getSharedPayrollSectionsAction(),
      getSharedPayrollStatusesAction(),
      getSharedUserRolesAction(),
      getSharedUserPrivilegesAction(),
      getSharedBranchesAction(),
      getSharedCitiesAction(),
      getSharedCountriesAction(),
      getSharedGosiCitiesAction(),
      getSharedEmployeeStatusesAction(),
      getSharedPaymentMethodsAction(),
    ]);

    // Unwrap results: if promise fulfilled, use value [data, err]; if rejected, use [null, err]
    const [
      [employees, errEmployees],
      [designations, errDesignations],
      [projects, errProjects],
      [payrollSections, errPayrollSections],
      [payrollStatuses, errPayrollStatuses],
      [userRoles, errUserRoles],
      [userPrivileges, errUserPrivileges],
      [branches, errBranches],
      [cities, errCities],
      [countries, errCountries],
      [gosiCities, errGosiCities],
      [employeeStatuses, errEmployeeStatuses],
      [paymentMethods, errPaymentMethods],
    ] = results.map((result) =>
      result.status === "fulfilled" ? result.value : [null, result.reason]
    ) as any; // Cast to any to bypass tuple index inference issues with dynamic map

    // Aggregate results, handling potential errors (though individual actions catch cache errors, they might throw db errors)
    // For now, return what we have. If an action failed, it returns [null, err].

    return {
      employees: employees || [],
      designations: designations || [],
      projects: projects || [],
      payrollSections: payrollSections || [],
      payrollStatuses: payrollStatuses || [],
      userRoles: userRoles || [],
      userPrivileges: userPrivileges || [],
      branches: branches || [],
      cities: cities || [],
      countries: countries || [],
      gosiCities: gosiCities || [],
      employeeStatuses: employeeStatuses || [],
      paymentMethods: paymentMethods || [],
    };
  });
