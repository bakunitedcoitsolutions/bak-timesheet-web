"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createUser,
  deleteUser,
  findUserById,
  listUsers,
  updateUser,
} from "./user.service";
import {
  CreateUserSchema,
  DeleteUserInput,
  DeleteUserSchema,
  GetUserByIdInput,
  GetUserByIdSchema,
  ListUsersParamsSchema,
  UpdateUserSchema,
} from "./user.schemas";

import { cache } from "@/lib/redis";
import { getSharedUserPrivilegesAction } from "../shared/actions";
import { CACHE_KEYS } from "../shared/constants";

export const listUsersAction = serverAction
  .input(ListUsersParamsSchema)
  .handler(async ({ input }) => {
    const response = await listUsers(input);
    return response;
  });

export const createUserAction = serverAction
  .input(CreateUserSchema)
  .handler(async ({ input }) => {
    const response = await createUser(input);
    // Invalidate and refresh user privileges cache if privileges were assigned
    await cache.delete(CACHE_KEYS.USER_PRIVILEGES);
    getSharedUserPrivilegesAction();
    return response;
  });

export const updateUserAction = serverAction
  .input(UpdateUserSchema)
  .handler(async ({ input }) => {
    const { id, ...rest } = input;
    const response = await updateUser(id, rest);
    // Invalidate and refresh user privileges cache as roles/privileges might change
    await cache.delete(CACHE_KEYS.USER_PRIVILEGES);
    getSharedUserPrivilegesAction();
    return response;
  });

export const getUserByIdAction = serverAction
  .input(GetUserByIdSchema)
  .handler(async ({ input }: { input: GetUserByIdInput }) => {
    const response = await findUserById(input.id);
    return response;
  });

export const deleteUserAction = serverAction
  .input(DeleteUserSchema)
  .handler(async ({ input }: { input: DeleteUserInput }) => {
    const response = await deleteUser(input.id);
    // Invalidate and refresh user privileges cache
    await cache.delete(CACHE_KEYS.USER_PRIVILEGES);
    getSharedUserPrivilegesAction();
    return response;
  });
