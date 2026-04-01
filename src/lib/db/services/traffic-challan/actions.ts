"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import { getServerAccessContext } from "@/lib/auth/helpers";
import {
  createTrafficChallan,
  updateTrafficChallan,
  findTrafficChallanById,
  listTrafficChallans,
  deleteTrafficChallan,
  bulkUploadTrafficChallans,
  listAllTrafficChallans,
} from "./traffic-challan.service";
import {
  CreateTrafficChallanSchema,
  UpdateTrafficChallanSchema,
  ListTrafficChallansParamsSchema,
  GetTrafficChallanByIdSchema,
  DeleteTrafficChallanSchema,
  BulkUploadTrafficChallanSchema,
  CreateTrafficChallanInput,
  UpdateTrafficChallanInput,
  GetTrafficChallanByIdInput,
  DeleteTrafficChallanInput,
  BulkUploadTrafficChallanInput,
  ListAllTrafficChallansParamsInput,
  ListAllTrafficChallansParamsSchema,
} from "./traffic-challan.schemas";

// Create Traffic Challan
export const createTrafficChallanAction = serverAction
  .input(CreateTrafficChallanSchema)
  .handler(async ({ input }: { input: CreateTrafficChallanInput }) => {
    const { isBranchScoped, userBranchId } = await getServerAccessContext();
    
    const response = await createTrafficChallan({
      ...input,
      branchId: isBranchScoped ? userBranchId : undefined,
    });
    return response;
  });

// Update Traffic Challan
export const updateTrafficChallanAction = serverAction
  .input(UpdateTrafficChallanSchema)
  .handler(async ({ input }: { input: UpdateTrafficChallanInput }) => {
    const { isBranchScoped, userBranchId } = await getServerAccessContext();
    const { id, ...rest } = input;
    
    const response = await updateTrafficChallan(id, {
      ...rest,
      branchId: isBranchScoped ? userBranchId : undefined,
    });
    return response;
  });

// List Traffic Challans
export const listTrafficChallansAction = serverAction
  .input(ListTrafficChallansParamsSchema)
  .handler(async ({ input }) => {
    const { isBranchScoped, userBranchId } = await getServerAccessContext();
    
    const response = await listTrafficChallans({
      ...input,
      branchId: isBranchScoped ? userBranchId : undefined,
    });
    return response;
  });

// Get Traffic Challan By ID
export const getTrafficChallanByIdAction = serverAction
  .input(GetTrafficChallanByIdSchema)
  .handler(async ({ input }: { input: GetTrafficChallanByIdInput }) => {
    const response = await findTrafficChallanById(input.id);
    return response;
  });

// Delete Traffic Challan
export const deleteTrafficChallanAction = serverAction
  .input(DeleteTrafficChallanSchema)
  .handler(async ({ input }: { input: DeleteTrafficChallanInput }) => {
    const { isBranchScoped, userBranchId } = await getServerAccessContext();
    
    const response = await deleteTrafficChallan(
      input.id,
      isBranchScoped ? userBranchId : undefined
    );
    return response;
  });

// Bulk Upload Traffic Challans
export const bulkUploadTrafficChallansAction = serverAction
  .input(BulkUploadTrafficChallanSchema)
  .handler(async ({ input }: { input: BulkUploadTrafficChallanInput }) => {
    const { isBranchScoped, userBranchId } = await getServerAccessContext();
    
    const response = await bulkUploadTrafficChallans({
      ...input,
      branchId: isBranchScoped ? userBranchId : undefined,
    });
    return response;
  });

// List ALL Traffic Challans (no pagination) — for exports
export const listAllTrafficChallansAction = serverAction
  .input(ListAllTrafficChallansParamsSchema)
  .handler(async ({ input }: { input: ListAllTrafficChallansParamsInput }) => {
    const { isBranchScoped, userBranchId } = await getServerAccessContext();
    
    const response = await listAllTrafficChallans({
      ...input,
      branchId: isBranchScoped ? userBranchId : undefined,
    });
    return response;
  });
