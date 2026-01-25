import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import {
  GetDesignationByIdInput,
  ListDesignationsParamsInput,
} from "./designation.schemas";
import {
  listDesignationsAction,
  createDesignationAction,
  updateDesignationAction,
  getDesignationByIdAction,
  deleteDesignationAction,
} from "./actions";

export const useGetDesignations = (input: ListDesignationsParamsInput) =>
  useQuery(listDesignationsAction, {
    queryKey: ["designations", input],
    input,
  });

export const useCreateDesignation = () =>
  useMutation(createDesignationAction, {
    mutationKey: ["create-designation"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["designations"],
      });
    },
  });

export const useUpdateDesignation = () =>
  useMutation(updateDesignationAction, {
    mutationKey: ["update-designation"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["designations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["designation", { id }],
      });
    },
  });

export const useGetDesignationById = (input: GetDesignationByIdInput) =>
  useQuery(getDesignationByIdAction, {
    queryKey: ["designation", input.id],
    input,
    enabled: !!input.id,
  });

export const useDeleteDesignation = () =>
  useMutation(deleteDesignationAction, {
    mutationKey: ["delete-designation"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["designations"],
      });
    },
  });
