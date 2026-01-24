import { useQuery } from "@/lib/zsa/zsa-query";
import { listUserRolesAction } from "./actions";

export const useGetUserRoles = () =>
  useQuery(listUserRolesAction, {
    queryKey: ["user-roles"],
    input: undefined,
  });
