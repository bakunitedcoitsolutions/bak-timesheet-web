import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import {
  GetExitReentryByIdInput,
  ListExitReentriesParamsInput,
} from "./exit-reentry.schemas";
import {
  listExitReentriesAction,
  createExitReentryAction,
  updateExitReentryAction,
  getExitReentryByIdAction,
  deleteExitReentryAction,
} from "./actions";

export const useGetExitReentries = (input: ListExitReentriesParamsInput) =>
  useQuery(listExitReentriesAction, {
    queryKey: ["exit-reentries", input],
    input,
  });

export const useCreateExitReentry = () =>
  useMutation(createExitReentryAction, {
    mutationKey: ["create-exit-reentry"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exit-reentries"],
      });
    },
  });

export const useUpdateExitReentry = () =>
  useMutation(updateExitReentryAction, {
    mutationKey: ["update-exit-reentry"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["exit-reentries"],
      });
      queryClient.invalidateQueries({
        queryKey: ["exit-reentry", { id }],
      });
    },
  });

export const useGetExitReentryById = (input: GetExitReentryByIdInput) =>
  useQuery(getExitReentryByIdAction, {
    queryKey: ["exit-reentry", input.id],
    input,
    enabled: !!input.id,
  });

export const useDeleteExitReentry = () =>
  useMutation(deleteExitReentryAction, {
    mutationKey: ["delete-exit-reentry"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exit-reentries"],
      });
    },
  });
