"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createDesignation,
  deleteDesignation,
  findDesignationById,
  listDesignations,
  updateDesignation,
} from "./designation.service";
import { cache } from "@/lib/redis";
import {
  getGlobalDataAction,
  getSharedDesignationsAction,
} from "../shared/actions";
import { CACHE_KEYS } from "../shared/constants";
import {
  CreateDesignationSchema,
  DeleteDesignationInput,
  DeleteDesignationSchema,
  GetDesignationByIdInput,
  GetDesignationByIdSchema,
  ListDesignationsParamsSchema,
  UpdateDesignationSchema,
} from "./designation.schemas";

export const listDesignationsAction = serverAction
  .input(ListDesignationsParamsSchema)
  .handler(async ({ input }) => {
    const response = await listDesignations(input);
    return response;
  });

export const createDesignationAction = serverAction
  .input(CreateDesignationSchema)
  .handler(async ({ input }) => {
    const response = await createDesignation(input);
    await cache.delete(CACHE_KEYS.DESIGNATIONS);
    getSharedDesignationsAction();
    getGlobalDataAction();
    return response;
  });

export const updateDesignationAction = serverAction
  .input(UpdateDesignationSchema)
  .handler(async ({ input }) => {
    const { id, ...rest } = input;
    const response = await updateDesignation(id, rest);
    await cache.delete(CACHE_KEYS.DESIGNATIONS);
    getSharedDesignationsAction();
    getGlobalDataAction();
    return response;
  });

export const getDesignationByIdAction = serverAction
  .input(GetDesignationByIdSchema)
  .handler(async ({ input }: { input: GetDesignationByIdInput }) => {
    const response = await findDesignationById(input.id);
    return response;
  });

export const deleteDesignationAction = serverAction
  .input(DeleteDesignationSchema)
  .handler(async ({ input }: { input: DeleteDesignationInput }) => {
    const response = await deleteDesignation(input.id);
    return response;
  });
