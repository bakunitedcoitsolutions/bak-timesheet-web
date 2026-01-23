import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import { ListUsersParamsInput } from "./user.schemas";
import { listUsersAction, createUserAction, updateUserAction } from "./actions";

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
    },
  });
