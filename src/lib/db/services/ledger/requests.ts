import { useQuery } from "@/lib/zsa/zsa-query";

import { GetLedgerByEmployeeCodeInput } from "./ledger.schemas";
import { getLedgerByEmployeeCodeAction } from "./actions";

export const useGetLedgerByEmployeeCode = (
  input: GetLedgerByEmployeeCodeInput
) =>
  useQuery(getLedgerByEmployeeCodeAction, {
    queryKey: ["ledger", input.employeeCode],
    input,
    enabled: !!input.employeeCode && input.employeeCode > 0,
  });
