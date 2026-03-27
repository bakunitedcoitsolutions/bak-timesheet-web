"use server";

import { createServerAction } from "zsa";
import * as service from "./payment-method.service";
import {
  CreatePaymentMethodSchema,
  UpdatePaymentMethodSchema,
  ListPaymentMethodsParamsSchema,
  GetPaymentMethodByIdSchema,
  DeletePaymentMethodSchema,
} from "./payment-method.schemas";

export const createPaymentMethodAction = createServerAction()
  .input(CreatePaymentMethodSchema)
  .handler(async ({ input }) => {
    return await service.createPaymentMethod(input);
  });

export const updatePaymentMethodAction = createServerAction()
  .input(UpdatePaymentMethodSchema)
  .handler(async ({ input }) => {
    const { id, ...data } = input;
    return await service.updatePaymentMethod(id, data);
  });

export const deletePaymentMethodAction = createServerAction()
  .input(DeletePaymentMethodSchema)
  .handler(async ({ input }) => {
    return await service.deletePaymentMethod(input.id);
  });

export const getPaymentMethodByIdAction = createServerAction()
  .input(GetPaymentMethodByIdSchema)
  .handler(async ({ input }) => {
    return await service.findPaymentMethodById(input.id);
  });

export const listPaymentMethodsAction = createServerAction()
  .input(ListPaymentMethodsParamsSchema)
  .handler(async ({ input }) => {
    return await service.listPaymentMethods(input);
  });
