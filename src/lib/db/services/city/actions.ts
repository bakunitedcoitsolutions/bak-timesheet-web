"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createCity,
  deleteCity,
  findCityById,
  listCities,
  updateCity,
} from "./city.service";
import { cache } from "@/lib/redis";
import { getGlobalDataAction, getSharedCitiesAction } from "../shared/actions";
import { CACHE_KEYS } from "../shared/constants";
import {
  CreateCitySchema,
  DeleteCitySchema,
  GetCityByIdInput,
  GetCityByIdSchema,
  ListCitiesParamsSchema,
  UpdateCitySchema,
} from "./city.schemas";

export const listCitiesAction = serverAction
  .input(ListCitiesParamsSchema)
  .handler(async ({ input }) => {
    const response = await listCities(input);
    return response;
  });

export const createCityAction = serverAction
  .input(CreateCitySchema)
  .handler(async ({ input }) => {
    const response = await createCity(input);
    await cache.delete(CACHE_KEYS.CITIES);
    getSharedCitiesAction();
    getGlobalDataAction();
    return response;
  });

export const updateCityAction = serverAction
  .input(UpdateCitySchema)
  .handler(async ({ input }) => {
    const { id, ...rest } = input;
    const response = await updateCity(id, rest);
    await cache.delete(CACHE_KEYS.CITIES);
    getSharedCitiesAction();
    getGlobalDataAction();
    return response;
  });

export const getCityByIdAction = serverAction
  .input(GetCityByIdSchema)
  .handler(async ({ input }: { input: GetCityByIdInput }) => {
    const response = await findCityById(input.id);
    return response;
  });

export const deleteCityAction = serverAction
  .input(DeleteCitySchema)
  .handler(async ({ input }) => {
    const response = await deleteCity(input.id);
    return response;
  });
