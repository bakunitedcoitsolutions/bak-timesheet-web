import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import { GetUserByIdInput, ListUsersParamsInput } from "./user.schemas";
import {
  listUsersAction,
  createUserAction,
  updateUserAction,
  getUserByIdAction,
  deleteUserAction,
  signInAction,
  signOutAction,
} from "./actions";

export const useGetUsers = (input: ListUsersParamsInput) =>
  useQuery(listUsersAction, {
    queryKey: ["users", input],
    input,
  });

export const useSignIn = () => useMutation(signInAction);

export const useSignOut = () => useMutation(signOutAction);

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

export const useDeleteUser = () =>
  useMutation(deleteUserAction, {
    mutationKey: ["delete-user"],
    onSuccess: () => {
      // Invalidate all queries starting with "users" (including ["users", input])
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
