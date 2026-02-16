"use server";

import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createAllowanceNotAvailable,
  deleteAllowanceNotAvailable,
  findAllowanceNotAvailableById,
  listAllowanceNotAvailable,
  updateAllowanceNotAvailable,
} from "./allowance-not-available.service";
import {
  CreateAllowanceNotAvailableSchema,
  DeleteAllowanceNotAvailableInput,
  DeleteAllowanceNotAvailableSchema,
  GetAllowanceNotAvailableByIdInput,
  GetAllowanceNotAvailableByIdSchema,
  ListAllowanceNotAvailableParamsSchema,
  UpdateAllowanceNotAvailableSchema,
} from "./allowance-not-available.schemas";

export const listAllowanceNotAvailableAction = serverAction
  .input(ListAllowanceNotAvailableParamsSchema)
  .handler(async ({ input }) => {
    const response = await listAllowanceNotAvailable(input);
    return response;
  });

export const createAllowanceNotAvailableAction = serverAction
  .input(CreateAllowanceNotAvailableSchema)
  .handler(async ({ input }) => {
    const response = await createAllowanceNotAvailable(input);
    return response;
  });

export const updateAllowanceNotAvailableAction = serverAction
  .input(UpdateAllowanceNotAvailableSchema)
  .handler(async ({ input }) => {
    const { id, ...rest } = input;
    const response = await updateAllowanceNotAvailable(id, rest);
    return response;
  });

export const getAllowanceNotAvailableByIdAction = serverAction
  .input(GetAllowanceNotAvailableByIdSchema)
  .handler(async ({ input }: { input: GetAllowanceNotAvailableByIdInput }) => {
    const response = await findAllowanceNotAvailableById(input.id);
    return response;
  });

export const deleteAllowanceNotAvailableAction = serverAction
  .input(DeleteAllowanceNotAvailableSchema)
  .handler(async ({ input }: { input: DeleteAllowanceNotAvailableInput }) => {
    const response = await deleteAllowanceNotAvailable(input.id);
    return response;
  });
