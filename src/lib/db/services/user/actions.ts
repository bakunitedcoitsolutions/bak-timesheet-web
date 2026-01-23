"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import { createUser, listUsers, updateUser } from "./user.service";
import {
  CreateUserSchema,
  ListUsersParamsSchema,
  UpdateUserSchema,
} from "./user.schemas";

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
    return response;
  });

export const updateUserAction = serverAction
  .input(UpdateUserSchema)
  .handler(async ({ input }) => {
    const { id, ...rest } = input;
    const response = await updateUser(id, rest);
    return response;
  });
