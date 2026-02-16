import { useMutation, useQuery } from "@/lib/zsa/zsa-query";
import { queryClient } from "@/lib/react-query";

import {
  createAllowanceNotAvailableAction,
  deleteAllowanceNotAvailableAction,
  getAllowanceNotAvailableByIdAction,
  listAllowanceNotAvailableAction,
  updateAllowanceNotAvailableAction,
} from "./actions";
import { ListAllowanceNotAvailableParamsInput } from "./allowance-not-available.schemas";

export const useListAllowanceNotAvailable = (
  input: ListAllowanceNotAvailableParamsInput
) => {
  return useQuery(listAllowanceNotAvailableAction, {
    queryKey: ["allowance-not-available", input],
    input,
  });
};

export const useGetAllowanceNotAvailableById = (input: { id: number }) => {
  return useQuery(getAllowanceNotAvailableByIdAction, {
    queryKey: ["allowance-not-available", input.id],
    input,
    enabled: !!input.id,
  });
};

export const useCreateAllowanceNotAvailable = () => {
  return useMutation(createAllowanceNotAvailableAction, {
    mutationKey: ["create-allowance-not-available"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allowance-not-available"],
      });
    },
  });
};

export const useUpdateAllowanceNotAvailable = () => {
  return useMutation(updateAllowanceNotAvailableAction, {
    mutationKey: ["update-allowance-not-available"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["allowance-not-available"],
      });
      queryClient.invalidateQueries({
        queryKey: ["allowance-not-available", id],
      });
    },
  });
};

export const useDeleteAllowanceNotAvailable = () => {
  return useMutation(deleteAllowanceNotAvailableAction, {
    mutationKey: ["delete-allowance-not-available"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allowance-not-available"],
      });
    },
  });
};
