import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import {
  GetCountryByIdInput,
  ListCountriesParamsInput,
} from "./country.schemas";
import {
  listCountriesAction,
  createCountryAction,
  updateCountryAction,
  getCountryByIdAction,
  deleteCountryAction,
} from "./actions";

export const useGetCountries = (input: ListCountriesParamsInput) =>
  useQuery(listCountriesAction, {
    queryKey: ["countries", input],
    input,
  });

export const useCreateCountry = () =>
  useMutation(createCountryAction, {
    mutationKey: ["create-country"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["countries"],
      });
    },
  });

export const useUpdateCountry = () =>
  useMutation(updateCountryAction, {
    mutationKey: ["update-country"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["countries"],
      });
      queryClient.invalidateQueries({
        queryKey: ["country", { id }],
      });
    },
  });

export const useGetCountryById = (input: GetCountryByIdInput) =>
  useQuery(getCountryByIdAction, {
    queryKey: ["country", input.id],
    input,
    enabled: !!input.id,
  });

export const useDeleteCountry = () =>
  useMutation(deleteCountryAction, {
    mutationKey: ["delete-country"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["countries"],
      });
    },
  });
