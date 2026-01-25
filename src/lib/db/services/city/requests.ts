import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import { GetCityByIdInput, ListCitiesParamsInput } from "./city.schemas";
import {
  listCitiesAction,
  createCityAction,
  updateCityAction,
  getCityByIdAction,
  deleteCityAction,
} from "./actions";

export const useGetCities = (input: ListCitiesParamsInput) =>
  useQuery(listCitiesAction, {
    queryKey: ["cities", input],
    input,
  });

export const useCreateCity = () =>
  useMutation(createCityAction, {
    mutationKey: ["create-city"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cities"],
      });
    },
  });

export const useUpdateCity = () =>
  useMutation(updateCityAction, {
    mutationKey: ["update-city"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["cities"],
      });
      queryClient.invalidateQueries({
        queryKey: ["city", { id }],
      });
    },
  });

export const useGetCityById = (input: GetCityByIdInput) =>
  useQuery(getCityByIdAction, {
    queryKey: ["city", input.id],
    input,
    enabled: !!input.id,
  });

export const useDeleteCity = () =>
  useMutation(deleteCityAction, {
    mutationKey: ["delete-city"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cities"],
      });
    },
  });
