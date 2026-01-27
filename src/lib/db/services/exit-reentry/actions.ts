"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createExitReentry,
  updateExitReentry,
  findExitReentryById,
  listExitReentries,
  deleteExitReentry,
} from "./exit-reentry.service";
import {
  CreateExitReentrySchema,
  UpdateExitReentrySchema,
  ListExitReentriesParamsSchema,
  GetExitReentryByIdSchema,
  DeleteExitReentrySchema,
  CreateExitReentryInput,
  UpdateExitReentryInput,
  GetExitReentryByIdInput,
  DeleteExitReentryInput,
} from "./exit-reentry.schemas";

// Create Exit Reentry
export const createExitReentryAction = serverAction
  .input(CreateExitReentrySchema)
  .handler(async ({ input }: { input: CreateExitReentryInput }) => {
    const response = await createExitReentry(input);
    return response;
  });

// Update Exit Reentry
export const updateExitReentryAction = serverAction
  .input(UpdateExitReentrySchema)
  .handler(async ({ input }: { input: UpdateExitReentryInput }) => {
    const { id, ...rest } = input;
    const response = await updateExitReentry(id, rest);
    return response;
  });

// List Exit Reentries
export const listExitReentriesAction = serverAction
  .input(ListExitReentriesParamsSchema)
  .handler(async ({ input }) => {
    const response = await listExitReentries(input);
    return response;
  });

// Get Exit Reentry By ID
export const getExitReentryByIdAction = serverAction
  .input(GetExitReentryByIdSchema)
  .handler(async ({ input }: { input: GetExitReentryByIdInput }) => {
    const response = await findExitReentryById(input.id);
    return response;
  });

// Delete Exit Reentry
export const deleteExitReentryAction = serverAction
  .input(DeleteExitReentrySchema)
  .handler(async ({ input }: { input: DeleteExitReentryInput }) => {
    const response = await deleteExitReentry(input.id);
    return response;
  });
