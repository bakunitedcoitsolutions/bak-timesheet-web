"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createCountry,
  deleteCountry,
  findCountryById,
  listCountries,
  updateCountry,
} from "./country.service";
import { cache } from "@/lib/redis";
import {
  getGlobalDataAction,
  getSharedCountriesAction,
} from "../shared/actions";
import { CACHE_KEYS } from "../shared/constants";
import {
  CreateCountrySchema,
  DeleteCountryInput,
  DeleteCountrySchema,
  GetCountryByIdInput,
  GetCountryByIdSchema,
  ListCountriesParamsSchema,
  UpdateCountrySchema,
} from "./country.schemas";

export const listCountriesAction = serverAction
  .input(ListCountriesParamsSchema)
  .handler(async ({ input }) => {
    const response = await listCountries(input);
    return response;
  });

export const createCountryAction = serverAction
  .input(CreateCountrySchema)
  .handler(async ({ input }) => {
    const response = await createCountry(input);
    await cache.delete(CACHE_KEYS.COUNTRIES);
    getSharedCountriesAction();
    getGlobalDataAction();
    return response;
  });

export const updateCountryAction = serverAction
  .input(UpdateCountrySchema)
  .handler(async ({ input }) => {
    const { id, ...rest } = input;
    const response = await updateCountry(id, rest);
    await cache.delete(CACHE_KEYS.COUNTRIES);
    getSharedCountriesAction();
    getGlobalDataAction();
    return response;
  });

export const getCountryByIdAction = serverAction
  .input(GetCountryByIdSchema)
  .handler(async ({ input }: { input: GetCountryByIdInput }) => {
    const response = await findCountryById(input.id);
    return response;
  });

export const deleteCountryAction = serverAction
  .input(DeleteCountrySchema)
  .handler(async ({ input }: { input: DeleteCountryInput }) => {
    const response = await deleteCountry(input.id);
    return response;
  });
