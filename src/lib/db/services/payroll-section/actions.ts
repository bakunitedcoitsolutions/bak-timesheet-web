"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createPayrollSection,
  deletePayrollSection,
  findPayrollSectionById,
  listPayrollSections,
  updatePayrollSection,
} from "./payroll-section.service";
import { cache } from "@/lib/redis";
import {
  getGlobalDataAction,
  getSharedPayrollSectionsAction,
} from "../shared/actions";
import { CACHE_KEYS } from "../shared/constants";
import {
  CreatePayrollSectionSchema,
  DeletePayrollSectionInput,
  DeletePayrollSectionSchema,
  GetPayrollSectionByIdInput,
  GetPayrollSectionByIdSchema,
  ListPayrollSectionsParamsSchema,
  UpdatePayrollSectionSchema,
} from "./payroll-section.schemas";

export const listPayrollSectionsAction = serverAction
  .input(ListPayrollSectionsParamsSchema)
  .handler(async ({ input }) => {
    const response = await listPayrollSections(input);
    return response;
  });

export const createPayrollSectionAction = serverAction
  .input(CreatePayrollSectionSchema)
  .handler(async ({ input }) => {
    const response = await createPayrollSection(input);
    await cache.delete(CACHE_KEYS.PAYROLL_SECTIONS);
    getSharedPayrollSectionsAction();
    getGlobalDataAction();
    return response;
  });

export const updatePayrollSectionAction = serverAction
  .input(UpdatePayrollSectionSchema)
  .handler(async ({ input }) => {
    const { id, ...rest } = input;
    const response = await updatePayrollSection(id, rest);
    await cache.delete(CACHE_KEYS.PAYROLL_SECTIONS);
    getSharedPayrollSectionsAction();
    getGlobalDataAction();
    return response;
  });

export const getPayrollSectionByIdAction = serverAction
  .input(GetPayrollSectionByIdSchema)
  .handler(async ({ input }: { input: GetPayrollSectionByIdInput }) => {
    const response = await findPayrollSectionById(input.id);
    return response;
  });

export const deletePayrollSectionAction = serverAction
  .input(DeletePayrollSectionSchema)
  .handler(async ({ input }: { input: DeletePayrollSectionInput }) => {
    const response = await deletePayrollSection(input.id);
    return response;
  });
