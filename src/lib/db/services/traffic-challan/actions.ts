"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createTrafficChallan,
  updateTrafficChallan,
  findTrafficChallanById,
  listTrafficChallans,
  deleteTrafficChallan,
  bulkUploadTrafficChallans,
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
} from "./traffic-challan.schemas";

// Create Traffic Challan
export const createTrafficChallanAction = serverAction
  .input(CreateTrafficChallanSchema)
  .handler(async ({ input }: { input: CreateTrafficChallanInput }) => {
    const response = await createTrafficChallan(input);
    return response;
  });

// Update Traffic Challan
export const updateTrafficChallanAction = serverAction
  .input(UpdateTrafficChallanSchema)
  .handler(async ({ input }: { input: UpdateTrafficChallanInput }) => {
    const { id, ...rest } = input;
    const response = await updateTrafficChallan(id, rest);
    return response;
  });

// List Traffic Challans
export const listTrafficChallansAction = serverAction
  .input(ListTrafficChallansParamsSchema)
  .handler(async ({ input }) => {
    const response = await listTrafficChallans(input);
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
    const response = await deleteTrafficChallan(input.id);
    return response;
  });

// Bulk Upload Traffic Challans
export const bulkUploadTrafficChallansAction = serverAction
  .input(BulkUploadTrafficChallanSchema)
  .handler(async ({ input }: { input: BulkUploadTrafficChallanInput }) => {
    const response = await bulkUploadTrafficChallans(input);
    return response;
  });
