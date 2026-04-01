"use server";
import { auth } from "@/lib/auth/auth";
import { USER_ROLES } from "@/utils/user.utility";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  listLoans,
  createLoan,
  updateLoan,
  deleteLoan,
  findLoanById,
  listAllLoans,
  bulkUploadLoans,
} from "./loan.service";
import {
  CreateLoanSchema,
  UpdateLoanSchema,
  DeleteLoanSchema,
  GetLoanByIdSchema,
  BulkUploadLoanSchema,
  ListLoansParamsSchema,
  ListAllLoansParamsSchema,
  CreateLoanInput,
  UpdateLoanInput,
  DeleteLoanInput,
  GetLoanByIdInput,
  BulkUploadLoanInput,
  ListAllLoansParamsInput,
} from "./loan.schemas";

// Create Loan
export const createLoanAction = serverAction
  .input(CreateLoanSchema)
  .handler(async ({ input }: { input: CreateLoanInput }) => {
    const session = await auth();
    const roleId = session?.user?.roleId;
    const userBranchId = session?.user?.branchId;

    const isBranchScoped =
      roleId === USER_ROLES.BRANCH_MANAGER || roleId === USER_ROLES.BRANCH_USER;

    const response = await createLoan({
      ...input,
      branchId: isBranchScoped ? (userBranchId as number) : undefined,
    });
    return response;
  });

// Update Loan
export const updateLoanAction = serverAction
  .input(UpdateLoanSchema)
  .handler(async ({ input }: { input: UpdateLoanInput }) => {
    const session = await auth();
    const roleId = session?.user?.roleId;
    const userBranchId = session?.user?.branchId;

    const isBranchScoped =
      roleId === USER_ROLES.BRANCH_MANAGER || roleId === USER_ROLES.BRANCH_USER;

    const { id, ...rest } = input;
    const response = await updateLoan(id, {
      ...rest,
      branchId: isBranchScoped ? (userBranchId as number) : undefined,
    });
    return response;
  });

// List Loans
export const listLoansAction = serverAction
  .input(ListLoansParamsSchema)
  .handler(async ({ input }) => {
    const session = await auth();
    const roleId = session?.user?.roleId;
    const userBranchId = session?.user?.branchId;

    const isBranchScoped =
      roleId === USER_ROLES.BRANCH_MANAGER || roleId === USER_ROLES.BRANCH_USER;

    const response = await listLoans({
      ...input,
      branchId: isBranchScoped ? (userBranchId as number) : undefined,
    });
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
    const session = await auth();
    const roleId = session?.user?.roleId;
    const userBranchId = session?.user?.branchId;

    const isBranchScoped =
      roleId === USER_ROLES.BRANCH_MANAGER || roleId === USER_ROLES.BRANCH_USER;

    const response = await deleteLoan(
      input.id,
      isBranchScoped ? (userBranchId as number) : undefined
    );
    return response;
  });

// Bulk Upload Loans
export const bulkUploadLoansAction = serverAction
  .input(BulkUploadLoanSchema)
  .handler(async ({ input }: { input: BulkUploadLoanInput }) => {
    const session = await auth();
    const roleId = session?.user?.roleId;
    const userBranchId = session?.user?.branchId;

    const isBranchScoped =
      roleId === USER_ROLES.BRANCH_MANAGER || roleId === USER_ROLES.BRANCH_USER;

    const response = await bulkUploadLoans({
      ...input,
      branchId: isBranchScoped ? (userBranchId as number) : undefined,
    });
    return response;
  });

// List ALL Loans (no pagination) — for exports
export const listAllLoansAction = serverAction
  .input(ListAllLoansParamsSchema)
  .handler(async ({ input }: { input: ListAllLoansParamsInput }) => {
    const session = await auth();
    const roleId = session?.user?.roleId;
    const userBranchId = session?.user?.branchId;

    const isBranchScoped =
      roleId === USER_ROLES.BRANCH_MANAGER || roleId === USER_ROLES.BRANCH_USER;

    const response = await listAllLoans({
      ...input,
      branchId: isBranchScoped ? (userBranchId as number) : undefined,
    });
    return response;
  });
