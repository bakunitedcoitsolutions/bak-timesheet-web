import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import {
  GetPaymentMethodByIdInput,
  ListPaymentMethodsParamsInput,
} from "./payment-method.schemas";
import {
  listPaymentMethodsAction,
  createPaymentMethodAction,
  updatePaymentMethodAction,
  getPaymentMethodByIdAction,
  deletePaymentMethodAction,
} from "./actions";

export const useGetPaymentMethods = (input: ListPaymentMethodsParamsInput) =>
  useQuery(listPaymentMethodsAction, {
    queryKey: ["payment-methods", input],
    input,
  });

export const useCreatePaymentMethod = () =>
  useMutation(createPaymentMethodAction, {
    mutationKey: ["create-payment-method"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payment-methods"],
      });
    },
  });

export const useUpdatePaymentMethod = () =>
  useMutation(updatePaymentMethodAction, {
    mutationKey: ["update-payment-method"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["payment-methods"],
      });
      queryClient.invalidateQueries({
        queryKey: ["payment-method", id],
      });
    },
  });

export const useGetPaymentMethodById = (input: GetPaymentMethodByIdInput) =>
  useQuery(getPaymentMethodByIdAction, {
    queryKey: ["payment-method", input.id],
    input,
    enabled: !!input.id,
  });

export const useDeletePaymentMethod = () =>
  useMutation(deletePaymentMethodAction, {
    mutationKey: ["delete-payment-method"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payment-methods"],
      });
    },
  });
