import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import { GetBranchByIdInput, ListBranchesParamsInput } from "./branch.schemas";
import {
  listBranchesAction,
  createBranchAction,
  updateBranchAction,
  getBranchByIdAction,
  deleteBranchAction,
} from "./actions";

export const useGetBranches = (input: ListBranchesParamsInput) =>
  useQuery(listBranchesAction, {
    queryKey: ["branches", input],
    input,
  });

export const useCreateBranch = () =>
  useMutation(createBranchAction, {
    mutationKey: ["create-branch"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: [
          "branches",
          {
            id,
          },
        ],
      });
    },
  });

export const useUpdateBranch = () =>
  useMutation(updateBranchAction, {
    mutationKey: ["update-branch"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: [
          "branches",
          {
            id,
          },
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "branch",
          {
            id: id,
          },
        ],
      });
    },
  });

export const useGetBranchById = (input: GetBranchByIdInput) =>
  useQuery(getBranchByIdAction, {
    queryKey: ["branch", input.id],
    input,
    enabled: !!input.id,
  });

export const useDeleteBranch = () =>
  useMutation(deleteBranchAction, {
    mutationKey: ["delete-branch"],
    onSuccess: () => {
      // Invalidate all queries starting with "branches" (including ["branches", input])
      queryClient.invalidateQueries({
        queryKey: ["branches"],
      });
    },
  });
