"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createGosiCity,
  deleteGosiCity,
  findGosiCityById,
  listGosiCities,
  updateGosiCity,
} from "./gosi-city.service";
import {
  CreateGosiCitySchema,
  DeleteGosiCityInput,
  DeleteGosiCitySchema,
  GetGosiCityByIdInput,
  GetGosiCityByIdSchema,
  ListGosiCitiesParamsSchema,
  UpdateGosiCitySchema,
} from "./gosi-city.schemas";

export const listGosiCitiesAction = serverAction
  .input(ListGosiCitiesParamsSchema)
  .handler(async ({ input }) => {
    const response = await listGosiCities(input);
    return response;
  });

export const createGosiCityAction = serverAction
  .input(CreateGosiCitySchema)
  .handler(async ({ input }) => {
    const response = await createGosiCity(input);
    return response;
  });

export const updateGosiCityAction = serverAction
  .input(UpdateGosiCitySchema)
  .handler(async ({ input }) => {
    const { id, ...rest } = input;
    const response = await updateGosiCity(id, rest);
    return response;
  });

export const getGosiCityByIdAction = serverAction
  .input(GetGosiCityByIdSchema)
  .handler(async ({ input }: { input: GetGosiCityByIdInput }) => {
    const response = await findGosiCityById(input.id);
    return response;
  });

export const deleteGosiCityAction = serverAction
  .input(DeleteGosiCitySchema)
  .handler(async ({ input }: { input: DeleteGosiCityInput }) => {
    const response = await deleteGosiCity(input.id);
    return response;
  });
