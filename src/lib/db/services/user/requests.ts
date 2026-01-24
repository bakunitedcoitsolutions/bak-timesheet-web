import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import { GetUserByIdInput, ListUsersParamsInput } from "./user.schemas";
import {
  listUsersAction,
  createUserAction,
  updateUserAction,
  getUserByIdAction,
} from "./actions";

export const useGetUsers = (input: ListUsersParamsInput) =>
  useQuery(listUsersAction, {
    queryKey: ["users", input],
    input,
  });

export const useCreateUser = () =>
  useMutation(createUserAction, {
    mutationKey: ["create-user"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: [
          "users",
          {
            id,
          },
        ],
      });
    },
  });

export const useUpdateUser = () =>
  useMutation(updateUserAction, {
    mutationKey: ["update-user"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: [
          "users",
          {
            id,
          },
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "user",
          {
            id: id,
          },
        ],
      });
    },
  });

export const useGetUserById = (input: GetUserByIdInput) =>
  useQuery(getUserByIdAction, {
    queryKey: ["user", input.id],
    input,
    enabled: !!input.id,
  });
