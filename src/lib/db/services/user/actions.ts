"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import { ListUsersParamsSchema } from "./user.dto";
import { listUsers } from "./user.service";

export const listUsersAction = serverAction
  .input(ListUsersParamsSchema)
  .handler(async ({ input }) => {
    const response = await listUsers(input);
    return response;
  });
