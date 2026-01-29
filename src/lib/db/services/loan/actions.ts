"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createLoan,
  updateLoan,
  findLoanById,
  listLoans,
  deleteLoan,
  bulkUploadLoans,
} from "./loan.service";
import {
  CreateLoanSchema,
  UpdateLoanSchema,
  ListLoansParamsSchema,
  GetLoanByIdSchema,
  DeleteLoanSchema,
  BulkUploadLoanSchema,
  CreateLoanInput,
  UpdateLoanInput,
  GetLoanByIdInput,
  DeleteLoanInput,
  BulkUploadLoanInput,
} from "./loan.schemas";

// Create Loan
export const createLoanAction = serverAction
  .input(CreateLoanSchema)
  .handler(async ({ input }: { input: CreateLoanInput }) => {
    const response = await createLoan(input);
    return response;
  });

// Update Loan
export const updateLoanAction = serverAction
  .input(UpdateLoanSchema)
  .handler(async ({ input }: { input: UpdateLoanInput }) => {
    const { id, ...rest } = input;
    const response = await updateLoan(id, rest);
    return response;
  });

// List Loans
export const listLoansAction = serverAction
  .input(ListLoansParamsSchema)
  .handler(async ({ input }) => {
    const response = await listLoans(input);
    return response;
  });

// Get Loan By ID
export const getLoanByIdAction = serverAction
  .input(GetLoanByIdSchema)
  .handler(async ({ input }: { input: GetLoanByIdInput }) => {
    const response = await findLoanById(input.id);
    return response;
  });

// Delete Loan
export const deleteLoanAction = serverAction
  .input(DeleteLoanSchema)
  .handler(async ({ input }: { input: DeleteLoanInput }) => {
    const response = await deleteLoan(input.id);
    return response;
  });

// Bulk Upload Loans
export const bulkUploadLoansAction = serverAction
  .input(BulkUploadLoanSchema)
  .handler(async ({ input }: { input: BulkUploadLoanInput }) => {
    const response = await bulkUploadLoans(input);
    return response;
  });
