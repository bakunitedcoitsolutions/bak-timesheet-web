"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createCity,
  deleteCity,
  findCityById,
  listCities,
  updateCity,
} from "./city.service";
import {
  CreateCitySchema,
  DeleteCityInput,
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
    return response;
  });

export const updateCityAction = serverAction
  .input(UpdateCitySchema)
  .handler(async ({ input }) => {
    const { id, ...rest } = input;
    const response = await updateCity(id, rest);
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
  .handler(async ({ input }: { input: DeleteCityInput }) => {
    const response = await deleteCity(input.id);
    return response;
  });
