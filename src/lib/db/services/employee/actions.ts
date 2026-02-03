"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createEmployeeStep1,
  updateEmployeeStep1,
  updateEmployeeStep2,
  updateEmployeeStep3,
  updateEmployeeStep4,
  updateEmployeeStep5,
  findEmployeeById,
  listEmployees,
  deleteEmployee,
} from "./employee.service";
import {
  CreateEmployeeStep1Schema,
  UpdateEmployeeStep1Schema,
  UpdateEmployeeStep2Schema,
  UpdateEmployeeStep3Schema,
  UpdateEmployeeStep4Schema,
  UpdateEmployeeStep5Schema,
  ListEmployeesParamsSchema,
  GetEmployeeByIdSchema,
  DeleteEmployeeSchema,
  UpdateEmployeeStep1Input,
  UpdateEmployeeStep2Input,
  UpdateEmployeeStep3Input,
  UpdateEmployeeStep4Input,
  UpdateEmployeeStep5Input,
  GetEmployeeByIdInput,
  DeleteEmployeeInput,
} from "./employee.schemas";

// Step 1: Create Employee
export const createEmployeeStep1Action = serverAction
  .input(CreateEmployeeStep1Schema)
  .handler(async ({ input }) => {
    const response = await createEmployeeStep1(input);
    return response;
  });

// Step 1: Update Employee (Basic Info)
export const updateEmployeeStep1Action = serverAction
  .input(UpdateEmployeeStep1Schema)
  .handler(async ({ input }: { input: UpdateEmployeeStep1Input }) => {
    const { id, ...rest } = input;
    const response = await updateEmployeeStep1(id, rest);
    return response;
  });

// Step 2: Update Employee (Contract Details)
export const updateEmployeeStep2Action = serverAction
  .input(UpdateEmployeeStep2Schema)
  .handler(async ({ input }: { input: UpdateEmployeeStep2Input }) => {
    const { id, ...rest } = input;
    const response = await updateEmployeeStep2(id, rest);
    return response;
  });

// Step 3: Update Employee (Identity)
export const updateEmployeeStep3Action = serverAction
  .input(UpdateEmployeeStep3Schema)
  .handler(async ({ input }: { input: UpdateEmployeeStep3Input }) => {
    const { id, ...rest } = input;
    const response = await updateEmployeeStep3(id, rest);
    return response;
  });

// Step 4: Update Employee (Financial Details)
export const updateEmployeeStep4Action = serverAction
  .input(UpdateEmployeeStep4Schema)
  .handler(async ({ input }: { input: UpdateEmployeeStep4Input }) => {
    const { id, ...rest } = input;
    const response = await updateEmployeeStep4(id, rest);
    return response;
  });

// Step 5: Update Employee (Other Details)
export const updateEmployeeStep5Action = serverAction
  .input(UpdateEmployeeStep5Schema)
  .handler(async ({ input }: { input: UpdateEmployeeStep5Input }) => {
    const { id, ...rest } = input;
    const response = await updateEmployeeStep5(id, rest);
    return response;
  });

// List Employees
export const listEmployeesAction = serverAction
  .input(ListEmployeesParamsSchema)
  .handler(async ({ input }) => {
    console.log("listEmployeesAction input:", input);
    const response = await listEmployees(input);
    console.log("listEmployeesAction response:", response);
    return response;
  });

// Get Employee By ID
export const getEmployeeByIdAction = serverAction
  .input(GetEmployeeByIdSchema)
  .handler(async ({ input }: { input: GetEmployeeByIdInput }) => {
    const response = await findEmployeeById(input.id);
    return response;
  });

// Delete Employee
export const deleteEmployeeAction = serverAction
  .input(DeleteEmployeeSchema)
  .handler(async ({ input }: { input: DeleteEmployeeInput }) => {
    const response = await deleteEmployee(input.id);
    return response;
  });
