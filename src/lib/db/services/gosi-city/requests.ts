import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import {
  GetGosiCityByIdInput,
  ListGosiCitiesParamsInput,
} from "./gosi-city.schemas";
import {
  listGosiCitiesAction,
  createGosiCityAction,
  updateGosiCityAction,
  getGosiCityByIdAction,
  deleteGosiCityAction,
} from "./actions";

export const useGetGosiCities = (input: ListGosiCitiesParamsInput) =>
  useQuery(listGosiCitiesAction, {
    queryKey: ["gosi-cities", input],
    input,
  });

export const useCreateGosiCity = () =>
  useMutation(createGosiCityAction, {
    mutationKey: ["create-gosi-city"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gosi-cities"],
      });
    },
  });

export const useUpdateGosiCity = () =>
  useMutation(updateGosiCityAction, {
    mutationKey: ["update-gosi-city"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["gosi-cities"],
      });
      queryClient.invalidateQueries({
        queryKey: ["gosi-city", { id }],
      });
    },
  });

export const useGetGosiCityById = (input: GetGosiCityByIdInput) =>
  useQuery(getGosiCityByIdAction, {
    queryKey: ["gosi-city", input.id],
    input,
    enabled: !!input.id,
  });

export const useDeleteGosiCity = () =>
  useMutation(deleteGosiCityAction, {
    mutationKey: ["delete-gosi-city"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gosi-cities"],
      });
    },
  });
