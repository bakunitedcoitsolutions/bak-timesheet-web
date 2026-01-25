import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import {
  GetEmployeeStatusByIdInput,
  ListEmployeeStatusesParamsInput,
} from "./employee-status.schemas";
import {
  listEmployeeStatusesAction,
  createEmployeeStatusAction,
  updateEmployeeStatusAction,
  getEmployeeStatusByIdAction,
  deleteEmployeeStatusAction,
} from "./actions";

export const useGetEmployeeStatuses = (
  input: ListEmployeeStatusesParamsInput
) =>
  useQuery(listEmployeeStatusesAction, {
    queryKey: ["employee-statuses", input],
    input,
  });

export const useCreateEmployeeStatus = () =>
  useMutation(createEmployeeStatusAction, {
    mutationKey: ["create-employee-status"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employee-statuses"],
      });
    },
  });

export const useUpdateEmployeeStatus = () =>
  useMutation(updateEmployeeStatusAction, {
    mutationKey: ["update-employee-status"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["employee-statuses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["employee-status", { id }],
      });
    },
  });

export const useGetEmployeeStatusById = (input: GetEmployeeStatusByIdInput) =>
  useQuery(getEmployeeStatusByIdAction, {
    queryKey: ["employee-status", input.id],
    input,
    enabled: !!input.id,
  });

export const useDeleteEmployeeStatus = () =>
  useMutation(deleteEmployeeStatusAction, {
    mutationKey: ["delete-employee-status"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employee-statuses"],
      });
    },
  });
