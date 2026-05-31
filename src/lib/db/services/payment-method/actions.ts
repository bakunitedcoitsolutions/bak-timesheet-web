"use server";

import {
  getGlobalDataAction,
  getSharedPaymentMethodsAction,
} from "../shared/actions";
import {
  CreatePaymentMethodSchema,
  UpdatePaymentMethodSchema,
  DeletePaymentMethodSchema,
  GetPaymentMethodByIdSchema,
  ListPaymentMethodsParamsSchema,
} from "./payment-method.schemas";
import { cache } from "@/lib/redis";
import { serverAction } from "@/lib/zsa/zsa-action";
import * as service from "./payment-method.service";
import { CACHE_KEYS } from "../shared/constants";

export const createPaymentMethodAction = serverAction
  .input(CreatePaymentMethodSchema)
  .handler(async ({ input }) => {
    const response = await service.createPaymentMethod(input);
    await cache.delete(CACHE_KEYS.PAYMENT_METHODS);
    getSharedPaymentMethodsAction();
    getGlobalDataAction();
    return response;
  });

export const updatePaymentMethodAction = serverAction
  .input(UpdatePaymentMethodSchema)
  .handler(async ({ input }) => {
    const { id, ...data } = input;
    const response = await service.updatePaymentMethod(id, data);
    await cache.delete(CACHE_KEYS.PAYMENT_METHODS);
    getSharedPaymentMethodsAction();
    getGlobalDataAction();
    return response;
  });

export const deletePaymentMethodAction = serverAction
  .input(DeletePaymentMethodSchema)
  .handler(async ({ input }) => {
    const response = await service.deletePaymentMethod(input.id);
    await cache.delete(CACHE_KEYS.PAYMENT_METHODS);
    getSharedPaymentMethodsAction();
    getGlobalDataAction();
    return response;
  });

export const getPaymentMethodByIdAction = serverAction
  .input(GetPaymentMethodByIdSchema)
  .handler(async ({ input }) => {
    return await service.findPaymentMethodById(input.id);
  });

export const listPaymentMethodsAction = serverAction
  .input(ListPaymentMethodsParamsSchema)
  .handler(async ({ input }) => {
    return await service.listPaymentMethods(input);
  });
