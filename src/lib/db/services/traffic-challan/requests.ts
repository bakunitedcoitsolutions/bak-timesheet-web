import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import {
  GetTrafficChallanByIdInput,
  ListTrafficChallansParamsInput,
} from "./traffic-challan.schemas";
import {
  listTrafficChallansAction,
  createTrafficChallanAction,
  updateTrafficChallanAction,
  getTrafficChallanByIdAction,
  deleteTrafficChallanAction,
} from "./actions";

export const useGetTrafficChallans = (input: ListTrafficChallansParamsInput) =>
  useQuery(listTrafficChallansAction, {
    queryKey: ["traffic-challans", input],
    input,
  });

export const useCreateTrafficChallan = () =>
  useMutation(createTrafficChallanAction, {
    mutationKey: ["create-traffic-challan"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["traffic-challans"],
      });
    },
  });

export const useUpdateTrafficChallan = () =>
  useMutation(updateTrafficChallanAction, {
    mutationKey: ["update-traffic-challan"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["traffic-challans"],
      });
      queryClient.invalidateQueries({
        queryKey: ["traffic-challan", { id }],
      });
    },
  });

export const useGetTrafficChallanById = (
  input: GetTrafficChallanByIdInput
) =>
  useQuery(getTrafficChallanByIdAction, {
    queryKey: ["traffic-challan", input.id],
    input,
    enabled: !!input.id,
  });

export const useDeleteTrafficChallan = () =>
  useMutation(deleteTrafficChallanAction, {
    mutationKey: ["delete-traffic-challan"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["traffic-challans"],
      });
    },
  });
