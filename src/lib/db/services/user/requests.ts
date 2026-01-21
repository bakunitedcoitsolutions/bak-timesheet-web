import { useQuery } from "@/lib/zsa/zsa-query";

import { listUsersAction } from "./actions";
import { ListUsersParamsInput } from "./user.dto";

export const useGetUsers = (input: ListUsersParamsInput) =>
  useQuery(listUsersAction, {
    queryKey: ["users", input],
    input,
  });
