import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import { GetLoanByIdInput, ListLoansParamsInput } from "./loan.schemas";
import {
  listLoansAction,
  createLoanAction,
  updateLoanAction,
  getLoanByIdAction,
  deleteLoanAction,
  bulkUploadLoansAction,
} from "./actions";

export const useGetLoans = (input: ListLoansParamsInput) =>
  useQuery(listLoansAction, {
    queryKey: ["loans", input],
    input,
  });

export const useCreateLoan = () =>
  useMutation(createLoanAction, {
    mutationKey: ["create-loan"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["loans"],
      });
    },
  });

export const useUpdateLoan = () =>
  useMutation(updateLoanAction, {
    mutationKey: ["update-loan"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["loans"],
      });
      queryClient.invalidateQueries({
        queryKey: ["loan", { id }],
      });
    },
  });

export const useGetLoanById = (input: GetLoanByIdInput) =>
  useQuery(getLoanByIdAction, {
    queryKey: ["loan", input.id],
    input,
    enabled: !!input.id,
  });

export const useDeleteLoan = () =>
  useMutation(deleteLoanAction, {
    mutationKey: ["delete-loan"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["loans"],
      });
    },
  });

export const useBulkUploadLoans = () =>
  useMutation(bulkUploadLoansAction, {
    mutationKey: ["bulk-upload-loans"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["loans"],
      });
    },
  });
