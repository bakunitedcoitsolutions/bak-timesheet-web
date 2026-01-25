"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createEmployeeStatus,
  deleteEmployeeStatus,
  findEmployeeStatusById,
  listEmployeeStatuses,
  updateEmployeeStatus,
} from "./employee-status.service";
import {
  CreateEmployeeStatusSchema,
  DeleteEmployeeStatusInput,
  DeleteEmployeeStatusSchema,
  GetEmployeeStatusByIdInput,
  GetEmployeeStatusByIdSchema,
  ListEmployeeStatusesParamsSchema,
  UpdateEmployeeStatusSchema,
} from "./employee-status.schemas";

export const listEmployeeStatusesAction = serverAction
  .input(ListEmployeeStatusesParamsSchema)
  .handler(async ({ input }) => {
    const response = await listEmployeeStatuses(input);
    return response;
  });

export const createEmployeeStatusAction = serverAction
  .input(CreateEmployeeStatusSchema)
  .handler(async ({ input }) => {
    const response = await createEmployeeStatus(input);
    return response;
  });

export const updateEmployeeStatusAction = serverAction
  .input(UpdateEmployeeStatusSchema)
  .handler(async ({ input }) => {
    const { id, ...rest } = input;
    const response = await updateEmployeeStatus(id, rest);
    return response;
  });

export const getEmployeeStatusByIdAction = serverAction
  .input(GetEmployeeStatusByIdSchema)
  .handler(async ({ input }: { input: GetEmployeeStatusByIdInput }) => {
    const response = await findEmployeeStatusById(input.id);
    return response;
  });

export const deleteEmployeeStatusAction = serverAction
  .input(DeleteEmployeeStatusSchema)
  .handler(async ({ input }: { input: DeleteEmployeeStatusInput }) => {
    const response = await deleteEmployeeStatus(input.id);
    return response;
  });
