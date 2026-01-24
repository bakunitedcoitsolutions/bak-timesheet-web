"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createBranch,
  deleteBranch,
  findBranchById,
  listBranches,
  updateBranch,
} from "./branch.service";
import {
  CreateBranchSchema,
  DeleteBranchInput,
  DeleteBranchSchema,
  GetBranchByIdInput,
  GetBranchByIdSchema,
  ListBranchesParamsSchema,
  UpdateBranchSchema,
} from "./branch.schemas";

export const listBranchesAction = serverAction
  .input(ListBranchesParamsSchema)
  .handler(async ({ input }) => {
    const response = await listBranches(input);
    return response;
  });

export const createBranchAction = serverAction
  .input(CreateBranchSchema)
  .handler(async ({ input }) => {
    const response = await createBranch(input);
    return response;
  });

export const updateBranchAction = serverAction
  .input(UpdateBranchSchema)
  .handler(async ({ input }) => {
    const { id, ...rest } = input;
    const response = await updateBranch(id, rest);
    return response;
  });

export const getBranchByIdAction = serverAction
  .input(GetBranchByIdSchema)
  .handler(async ({ input }: { input: GetBranchByIdInput }) => {
    const response = await findBranchById(input.id);
    return response;
  });

export const deleteBranchAction = serverAction
  .input(DeleteBranchSchema)
  .handler(async ({ input }: { input: DeleteBranchInput }) => {
    const response = await deleteBranch(input.id);
    return response;
  });
