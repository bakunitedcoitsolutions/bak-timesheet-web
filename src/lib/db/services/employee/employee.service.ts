/**
 * Employee Service
 * Business logic for employee operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  CreateEmployeeStep1Data,
  UpdateEmployeeStep1Data,
  UpdateEmployeeStep2Data,
  UpdateEmployeeStep3Data,
  UpdateEmployeeStep4Data,
  UpdateEmployeeStep5Data,
  ListEmployeesParams,
  ListEmployeesResponse,
} from "./employee.dto";

// Type helper for Prisma transaction client
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

// Reusable select object
const employeeSelect = {
  id: true,
  // Step 1
  profilePicture: true,
  employeeCode: true,
  nameEn: true,
  nameAr: true,
  dob: true,
  phone: true,
  // Step 2
  gender: true,
  countryId: true,
  cityId: true,
  statusId: true,
  branchId: true,
  designationId: true,
  payrollSectionId: true,
  isDeductable: true,
  isFixed: true,
  workingDays: true,
  workingHours: true,
  hourlyRate: true,
  salary: true,
  foodAllowance: true,
  mobileAllowance: true,
  otherAllowance: true,
  contractStartDate: true,
  contractEndDate: true,
  contractDocument: true,
  contractEndReason: true,
  joiningDate: true,
  // Step 3
  idCardNo: true,
  idCardExpiryDate: true,
  idCardDocument: true,
  profession: true,
  nationality: true,
  passportNo: true,
  passportExpiryDate: true,
  passportDocument: true,
  // Step 4
  bankName: true,
  bankCode: true,
  iban: true,
  gosiSalary: true,
  gosiCityId: true,
  // Step 5
  openingBalance: true,
  isCardDelivered: true,
  cardDocument: true,
  // Timestamps
  createdAt: true,
  updatedAt: true,
};

/**
 * Helper function to convert Decimal to number for client serialization
 */
import { convertDecimalToNumber } from "@/lib/db/utils";

/**
 * Helper function to normalize date strings to Date objects
 */
const normalizeDate = (date: Date | string | undefined): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return date;
  return new Date(date);
};

/**
 * Helper function to generate a unique random employee code
 * Returns a random number between 1000000 and 2147483647 (PostgreSQL INTEGER max)
 * Uses timestamp in seconds + random component for uniqueness
 */
const generateRandomEmployeeCode = (): number => {
  // Use seconds since epoch (fits in INTEGER range) + random component
  const timestampSeconds = Math.floor(Date.now() / 1000);
  const randomComponent = Math.floor(Math.random() * 1000000); // 0-999999

  // Combine: timestamp (ensures uniqueness) + random (adds variation)
  // Ensure it doesn't exceed INTEGER max (2,147,483,647)
  const code = timestampSeconds + randomComponent;

  // If somehow it exceeds max, use a fallback random number
  if (code > 2147483647) {
    return Math.floor(1000000 + Math.random() * 9000000); // 7-8 digit number
  }

  return code;
};

/**
 * Create a new employee (Step 1: Basic Info)
 */
export const createEmployeeStep1 = async (data: CreateEmployeeStep1Data) => {
  return prisma.$transaction(
    async (tx: PrismaTransactionClient) => {
      // Handle employee code assignment
      const existingEmployee = await tx.employee.findUnique({
        where: { employeeCode: data.employeeCode },
        select: { id: true },
      });

      if (existingEmployee) {
        // If reassignEmployeeCode is true, assign random code to previous employee
        if (data.reassignEmployeeCode) {
          const randomCode = generateRandomEmployeeCode();
          await tx.employee.update({
            where: { id: existingEmployee.id },
            data: { employeeCode: randomCode },
          });
        } else {
          throw new Error("Employee code already exists");
        }
      }

      const employee = await tx.employee.create({
        data: {
          profilePicture: data.profilePicture ?? null,
          employeeCode: data.employeeCode,
          nameEn: data.nameEn,
          nameAr: data.nameAr ?? null,
          dob: normalizeDate(data.dob),
          phone: data.phone ?? null,
        },
        select: employeeSelect,
      });

      // Convert Decimal fields to numbers for client serialization
      return {
        ...employee,
        hourlyRate: convertDecimalToNumber(employee.hourlyRate),
        salary: convertDecimalToNumber(employee.salary),
        foodAllowance: convertDecimalToNumber(employee.foodAllowance),
        mobileAllowance: convertDecimalToNumber(employee.mobileAllowance),
        otherAllowance: convertDecimalToNumber(employee.otherAllowance),
        gosiSalary: convertDecimalToNumber(employee.gosiSalary),
        openingBalance: convertDecimalToNumber(employee.openingBalance),
      };
    },
    {
      maxWait: 10000, // Wait up to 10 seconds to acquire a transaction
      timeout: 30000, // Transaction can run for up to 30 seconds
    }
  );
};

/**
 * Update employee (Step 1: Basic Info)
 */
export const updateEmployeeStep1 = async (
  id: number,
  data: UpdateEmployeeStep1Data
) => {
  return prisma.$transaction(
    async (tx: PrismaTransactionClient) => {
      // Validate employee exists
      const existingEmployee = await tx.employee.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existingEmployee) {
        throw new Error("Employee not found");
      }

      // Handle employee code assignment
      const employeeWithCode = await tx.employee.findUnique({
        where: { employeeCode: data.employeeCode },
        select: { id: true },
      });

      if (employeeWithCode && employeeWithCode.id !== id) {
        // If reassignEmployeeCode is true, assign random code to previous employee
        if (data.reassignEmployeeCode) {
          const randomCode = generateRandomEmployeeCode();
          await tx.employee.update({
            where: { id: employeeWithCode.id },
            data: { employeeCode: randomCode },
          });
        } else {
          throw new Error("Employee code already exists");
        }
      }

      const updateData: any = {};

      if (data.profilePicture !== undefined)
        updateData.profilePicture = data.profilePicture ?? null;
      updateData.employeeCode = data.employeeCode;
      if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
      if (data.nameAr !== undefined) updateData.nameAr = data.nameAr ?? null;
      if (data.dob !== undefined) updateData.dob = normalizeDate(data.dob);
      if (data.phone !== undefined) updateData.phone = data.phone ?? null;

      const employee = await tx.employee.update({
        where: { id },
        data: updateData,
        select: employeeSelect,
      });

      // Convert Decimal fields to numbers for client serialization
      return {
        ...employee,
        hourlyRate: convertDecimalToNumber(employee.hourlyRate),
        salary: convertDecimalToNumber(employee.salary),
        foodAllowance: convertDecimalToNumber(employee.foodAllowance),
        mobileAllowance: convertDecimalToNumber(employee.mobileAllowance),
        otherAllowance: convertDecimalToNumber(employee.otherAllowance),
        gosiSalary: convertDecimalToNumber(employee.gosiSalary),
        openingBalance: convertDecimalToNumber(employee.openingBalance),
      };
    },
    {
      maxWait: 10000, // Wait up to 10 seconds to acquire a transaction
      timeout: 30000, // Transaction can run for up to 30 seconds
    }
  );
};

/**
 * Update employee (Step 2: Contract Details)
 */
export const updateEmployeeStep2 = async (
  id: number,
  data: UpdateEmployeeStep2Data
) => {
  // Validate employee exists
  const existingEmployee = await prisma.employee.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingEmployee) {
    throw new Error("Employee not found");
  }

  // Validate foreign keys if provided
  if (data.countryId !== undefined && data.countryId !== null) {
    const countryExists = await prisma.country.findUnique({
      where: { id: data.countryId },
      select: { id: true },
    });
    if (!countryExists) {
      throw new Error(`Country with ID ${data.countryId} does not exist`);
    }
  }

  if (data.cityId !== undefined && data.cityId !== null) {
    const cityExists = await prisma.city.findUnique({
      where: { id: data.cityId },
      select: { id: true },
    });
    if (!cityExists) {
      throw new Error(`City with ID ${data.cityId} does not exist`);
    }
  }

  if (data.statusId !== undefined && data.statusId !== null) {
    const statusExists = await prisma.employeeStatus.findUnique({
      where: { id: data.statusId },
      select: { id: true },
    });
    if (!statusExists) {
      throw new Error(
        `Employee status with ID ${data.statusId} does not exist`
      );
    }
  }

  if (data.branchId !== undefined && data.branchId !== null) {
    const branchExists = await prisma.branch.findUnique({
      where: { id: data.branchId },
      select: { id: true },
    });
    if (!branchExists) {
      throw new Error(`Branch with ID ${data.branchId} does not exist`);
    }
  }

  // Validate designationId (required)
  const designationExists = await prisma.designation.findUnique({
    where: { id: data.designationId },
    select: { id: true },
  });
  if (!designationExists) {
    throw new Error(`Designation with ID ${data.designationId} does not exist`);
  }

  // Validate payrollSectionId (required)
  const payrollSectionExists = await prisma.payrollSection.findUnique({
    where: { id: data.payrollSectionId },
    select: { id: true },
  });
  if (!payrollSectionExists) {
    throw new Error(
      `Payroll section with ID ${data.payrollSectionId} does not exist`
    );
  }

  const updateData: any = {};

  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.countryId !== undefined)
    updateData.countryId = data.countryId ?? null;
  if (data.cityId !== undefined) updateData.cityId = data.cityId ?? null;
  if (data.statusId !== undefined) updateData.statusId = data.statusId ?? null;
  if (data.branchId !== undefined) updateData.branchId = data.branchId ?? null;
  // designationId and payrollSectionId are required
  updateData.designationId = data.designationId;
  updateData.payrollSectionId = data.payrollSectionId;
  if (data.isDeductable !== undefined)
    updateData.isDeductable = data.isDeductable;
  if (data.isFixed !== undefined) updateData.isFixed = data.isFixed;
  if (data.workingDays !== undefined)
    updateData.workingDays = data.workingDays ?? null;
  if (data.workingHours !== undefined)
    updateData.workingHours = data.workingHours ?? null;
  if (data.hourlyRate !== undefined)
    updateData.hourlyRate = data.hourlyRate ?? null;
  if (data.salary !== undefined) updateData.salary = data.salary ?? null;
  if (data.foodAllowance !== undefined)
    updateData.foodAllowance = data.foodAllowance ?? null;
  if (data.mobileAllowance !== undefined)
    updateData.mobileAllowance = data.mobileAllowance ?? null;
  if (data.otherAllowance !== undefined)
    updateData.otherAllowance = data.otherAllowance ?? null;
  if (data.contractStartDate !== undefined)
    updateData.contractStartDate = normalizeDate(data.contractStartDate);
  if (data.contractEndDate !== undefined)
    updateData.contractEndDate = normalizeDate(data.contractEndDate);
  if (data.contractDocument !== undefined)
    updateData.contractDocument = data.contractDocument ?? null;
  if (data.contractEndReason !== undefined)
    updateData.contractEndReason = data.contractEndReason ?? null;
  if (data.joiningDate !== undefined)
    updateData.joiningDate = normalizeDate(data.joiningDate);

  const employee = await prisma.employee.update({
    where: { id },
    data: updateData,
    select: employeeSelect,
  });

  // Convert Decimal fields to numbers for client serialization
  return {
    ...employee,
    hourlyRate: convertDecimalToNumber(employee.hourlyRate),
    salary: convertDecimalToNumber(employee.salary),
    foodAllowance: convertDecimalToNumber(employee.foodAllowance),
    mobileAllowance: convertDecimalToNumber(employee.mobileAllowance),
    otherAllowance: convertDecimalToNumber(employee.otherAllowance),
    gosiSalary: convertDecimalToNumber(employee.gosiSalary),
    openingBalance: convertDecimalToNumber(employee.openingBalance),
  };
};

/**
 * Update employee (Step 3: Identity)
 */
export const updateEmployeeStep3 = async (
  id: number,
  data: UpdateEmployeeStep3Data
) => {
  // Validate employee exists
  const existingEmployee = await prisma.employee.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingEmployee) {
    throw new Error("Employee not found");
  }

  const updateData: any = {};

  if (data.idCardNo !== undefined) updateData.idCardNo = data.idCardNo ?? null;
  if (data.idCardExpiryDate !== undefined)
    updateData.idCardExpiryDate = normalizeDate(data.idCardExpiryDate);
  if (data.idCardDocument !== undefined)
    updateData.idCardDocument = data.idCardDocument ?? null;
  if (data.profession !== undefined)
    updateData.profession = data.profession ?? null;
  if (data.nationality !== undefined)
    updateData.nationality = data.nationality ?? null;
  if (data.passportNo !== undefined)
    updateData.passportNo = data.passportNo ?? null;
  if (data.passportExpiryDate !== undefined)
    updateData.passportExpiryDate = normalizeDate(data.passportExpiryDate);
  if (data.passportDocument !== undefined)
    updateData.passportDocument = data.passportDocument ?? null;

  const employee = await prisma.employee.update({
    where: { id },
    data: updateData,
    select: employeeSelect,
  });

  // Convert Decimal fields to numbers for client serialization
  return {
    ...employee,
    hourlyRate: convertDecimalToNumber(employee.hourlyRate),
    salary: convertDecimalToNumber(employee.salary),
    foodAllowance: convertDecimalToNumber(employee.foodAllowance),
    mobileAllowance: convertDecimalToNumber(employee.mobileAllowance),
    otherAllowance: convertDecimalToNumber(employee.otherAllowance),
    gosiSalary: convertDecimalToNumber(employee.gosiSalary),
    openingBalance: convertDecimalToNumber(employee.openingBalance),
  };
};

/**
 * Update employee (Step 4: Financial Details)
 */
export const updateEmployeeStep4 = async (
  id: number,
  data: UpdateEmployeeStep4Data
) => {
  // Validate employee exists
  const existingEmployee = await prisma.employee.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingEmployee) {
    throw new Error("Employee not found");
  }

  // Validate foreign keys if provided
  if (data.gosiCityId !== undefined && data.gosiCityId !== null) {
    const gosiCityExists = await prisma.gosiCity.findUnique({
      where: { id: data.gosiCityId },
      select: { id: true },
    });
    if (!gosiCityExists) {
      throw new Error(`GOSI city with ID ${data.gosiCityId} does not exist`);
    }
  }

  const updateData: any = {};

  if (data.bankName !== undefined) updateData.bankName = data.bankName ?? null;
  if (data.bankCode !== undefined) updateData.bankCode = data.bankCode ?? null;
  if (data.iban !== undefined) updateData.iban = data.iban ?? null;
  if (data.gosiSalary !== undefined)
    updateData.gosiSalary = data.gosiSalary ?? null;
  if (data.gosiCityId !== undefined)
    updateData.gosiCityId = data.gosiCityId ?? null;

  const employee = await prisma.employee.update({
    where: { id },
    data: updateData,
    select: employeeSelect,
  });

  // Convert Decimal fields to numbers for client serialization
  return {
    ...employee,
    hourlyRate: convertDecimalToNumber(employee.hourlyRate),
    salary: convertDecimalToNumber(employee.salary),
    foodAllowance: convertDecimalToNumber(employee.foodAllowance),
    mobileAllowance: convertDecimalToNumber(employee.mobileAllowance),
    otherAllowance: convertDecimalToNumber(employee.otherAllowance),
    gosiSalary: convertDecimalToNumber(employee.gosiSalary),
    openingBalance: convertDecimalToNumber(employee.openingBalance),
  };
};

/**
 * Update employee (Step 5: Other Details)
 */
export const updateEmployeeStep5 = async (
  id: number,
  data: UpdateEmployeeStep5Data
) => {
  // Validate employee exists
  const existingEmployee = await prisma.employee.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingEmployee) {
    throw new Error("Employee not found");
  }

  const updateData: any = {};

  if (data.openingBalance !== undefined)
    updateData.openingBalance = data.openingBalance ?? null;
  if (data.isCardDelivered !== undefined)
    updateData.isCardDelivered = data.isCardDelivered;
  if (data.cardDocument !== undefined)
    updateData.cardDocument = data.cardDocument ?? null;

  const employee = await prisma.employee.update({
    where: { id },
    data: updateData,
    select: employeeSelect,
  });

  // Convert Decimal fields to numbers for client serialization
  return {
    ...employee,
    hourlyRate: convertDecimalToNumber(employee.hourlyRate),
    salary: convertDecimalToNumber(employee.salary),
    foodAllowance: convertDecimalToNumber(employee.foodAllowance),
    mobileAllowance: convertDecimalToNumber(employee.mobileAllowance),
    otherAllowance: convertDecimalToNumber(employee.otherAllowance),
    gosiSalary: convertDecimalToNumber(employee.gosiSalary),
    openingBalance: convertDecimalToNumber(employee.openingBalance),
  };
};

/**
 * Find employee by ID
 */
export const findEmployeeById = async (id: number) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    select: employeeSelect,
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  // Convert Decimal fields to numbers for client serialization
  return {
    ...employee,
    hourlyRate: convertDecimalToNumber(employee.hourlyRate),
    salary: convertDecimalToNumber(employee.salary),
    foodAllowance: convertDecimalToNumber(employee.foodAllowance),
    mobileAllowance: convertDecimalToNumber(employee.mobileAllowance),
    otherAllowance: convertDecimalToNumber(employee.otherAllowance),
    gosiSalary: convertDecimalToNumber(employee.gosiSalary),
    openingBalance: convertDecimalToNumber(employee.openingBalance),
  };
};

/**
 * List employees with pagination, sorting, and search
 */
export const listEmployees = async (
  params: ListEmployeesParams
): Promise<ListEmployeesResponse> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  // Search filter
  if (params.search) {
    const searchNumber = parseInt(params.search, 10);
    const isNumberSearch = !isNaN(searchNumber);

    where.OR = [
      { nameEn: { contains: params.search, mode: "insensitive" } },
      { nameAr: { contains: params.search, mode: "insensitive" } },
      ...(isNumberSearch ? [{ employeeCode: searchNumber }] : []),
      { phone: { contains: params.search, mode: "insensitive" } },
    ];
  }

  // Filter by branchId
  if (params.branchId !== undefined) {
    where.branchId = params.branchId;
  }

  // Filter by statusId
  if (params.statusId !== undefined) {
    where.statusId = params.statusId;
  }

  // Filter by designationId
  if (params.designationId !== undefined) {
    where.designationId = params.designationId;
  }

  // Filter by payrollSectionId
  if (params.payrollSectionId !== undefined) {
    where.payrollSectionId = params.payrollSectionId;
  }

  // Build orderBy clause
  const orderBy: any = {};
  if (params.sortBy) {
    orderBy[params.sortBy] = params.sortOrder ?? "asc";
  } else {
    orderBy.createdAt = "desc"; // Default sort
  }

  // Get total count
  const total = await prisma.employee.count({ where });

  // Get employees
  const employees = await prisma.employee.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    select: employeeSelect,
  });

  // Convert Decimal fields to numbers for client serialization
  const employeesWithNumbers = employees.map((employee) => ({
    ...employee,
    hourlyRate: convertDecimalToNumber(employee.hourlyRate),
    salary: convertDecimalToNumber(employee.salary),
    foodAllowance: convertDecimalToNumber(employee.foodAllowance),
    mobileAllowance: convertDecimalToNumber(employee.mobileAllowance),
    otherAllowance: convertDecimalToNumber(employee.otherAllowance),
    gosiSalary: convertDecimalToNumber(employee.gosiSalary),
    openingBalance: convertDecimalToNumber(employee.openingBalance),
  }));

  return {
    employees: employeesWithNumbers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete employee
 */
export const deleteEmployee = async (id: number) => {
  // Validate employee exists
  const existingEmployee = await prisma.employee.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingEmployee) {
    throw new Error("Employee not found");
  }

  await prisma.employee.delete({
    where: { id },
  });

  return { success: true };
};
