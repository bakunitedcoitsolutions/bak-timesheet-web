"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import { getLedgerByEmployeeCode } from "./ledger.service";
import {
  GetLedgerByEmployeeCodeSchema,
  GetLedgerByEmployeeCodeInput,
} from "./ledger.schemas";

// Get Ledger By Employee Code
export const getLedgerByEmployeeCodeAction = serverAction
  .input(GetLedgerByEmployeeCodeSchema)
  .handler(
    async ({ input }: { input: GetLedgerByEmployeeCodeInput }) => {
      const response = await getLedgerByEmployeeCode(input);
      return response;
    }
  );
