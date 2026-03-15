"use server";
import { publicAction, serverAction } from "@/lib/zsa/zsa-action";
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

import { compare } from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/utils/schemas";
import { signOut } from "@/lib/auth";

export const listUsersAction = serverAction
  .input(ListUsersParamsSchema)
  .handler(async ({ input }) => {
    const response = await listUsers(input);
    return response;
  });

export const signInAction = publicAction
  .input(loginSchema)
  .handler(async ({ input }) => {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      throw new Error("Account is inactive. Please contact an administrator.");
    }

    const isPasswordValid = await compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    return { ok: true };
  });

export const signOutAction = publicAction.handler(async () => {
  await signOut({ redirect: false });
  return { ok: true };
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
