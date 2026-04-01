"use server";
import {
  GetLedgerByEmployeeCodeInput,
  GetLedgerByEmployeeCodeSchema,
} from "./ledger.schemas";
import { serverAction } from "@/lib/zsa/zsa-action";
import { getLedgerByEmployeeCode } from "./ledger.service";
import { getServerAccessContext } from "@/lib/auth/helpers";

// Get Ledger By Employee Code
export const getLedgerByEmployeeCodeAction = serverAction
  .input(GetLedgerByEmployeeCodeSchema)
  .handler(async ({ input }: { input: GetLedgerByEmployeeCodeInput }) => {
    const { isBranchScoped, userBranchId } = await getServerAccessContext();

    const response = await getLedgerByEmployeeCode({
      ...input,
      branchId: isBranchScoped ? userBranchId : undefined,
    });
    return response;
  });
