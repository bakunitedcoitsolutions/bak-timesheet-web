"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import { listUserRoles } from "./user-role.service";
import { z } from "zod";

export const listUserRolesAction = serverAction
  .input(z.void())
  .handler(async () => {
    const response = await listUserRoles();
    return response;
  });
