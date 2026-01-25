import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import {
  GetPayrollSectionByIdInput,
  ListPayrollSectionsParamsInput,
} from "./payroll-section.schemas";
import {
  listPayrollSectionsAction,
  createPayrollSectionAction,
  updatePayrollSectionAction,
  getPayrollSectionByIdAction,
  deletePayrollSectionAction,
} from "./actions";

export const useGetPayrollSections = (input: ListPayrollSectionsParamsInput) =>
  useQuery(listPayrollSectionsAction, {
    queryKey: ["payroll-sections", input],
    input,
  });

export const useCreatePayrollSection = () =>
  useMutation(createPayrollSectionAction, {
    mutationKey: ["create-payroll-section"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payroll-sections"],
      });
    },
  });

export const useUpdatePayrollSection = () =>
  useMutation(updatePayrollSectionAction, {
    mutationKey: ["update-payroll-section"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["payroll-sections"],
      });
      queryClient.invalidateQueries({
        queryKey: ["payroll-section", { id }],
      });
    },
  });

export const useGetPayrollSectionById = (input: GetPayrollSectionByIdInput) =>
  useQuery(getPayrollSectionByIdAction, {
    queryKey: ["payroll-section", input.id],
    input,
    enabled: !!input.id,
  });

export const useDeletePayrollSection = () =>
  useMutation(deletePayrollSectionAction, {
    mutationKey: ["delete-payroll-section"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payroll-sections"],
      });
    },
  });
