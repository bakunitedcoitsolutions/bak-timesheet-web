import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import {
  GetEmployeeByIdInput,
  ListEmployeesParamsInput,
} from "./employee.schemas";
import {
  createEmployeeStep1Action,
  updateEmployeeStep1Action,
  updateEmployeeStep2Action,
  updateEmployeeStep3Action,
  updateEmployeeStep4Action,
  updateEmployeeStep5Action,
  listEmployeesAction,
  getEmployeeByIdAction,
  deleteEmployeeAction,
} from "./actions";

// Step 1: Create Employee
export const useCreateEmployeeStep1 = () =>
  useMutation(createEmployeeStep1Action, {
    mutationKey: ["create-employee-step1"],
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      // Invalidate individual employee query if we have the ID
      if (variables && "id" in variables) {
        queryClient.invalidateQueries({
          queryKey: ["employee", { id: variables.id }],
        });
      }
    },
  });

// Step 1: Update Employee (Basic Info)
export const useUpdateEmployeeStep1 = () =>
  useMutation(updateEmployeeStep1Action, {
    mutationKey: ["update-employee-step1"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      queryClient.invalidateQueries({
        queryKey: ["employee", { id }],
      });
    },
  });

// Step 2: Update Employee (Contract Details)
export const useUpdateEmployeeStep2 = () =>
  useMutation(updateEmployeeStep2Action, {
    mutationKey: ["update-employee-step2"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      queryClient.invalidateQueries({
        queryKey: ["employee", { id }],
      });
    },
  });

// Step 3: Update Employee (Identity)
export const useUpdateEmployeeStep3 = () =>
  useMutation(updateEmployeeStep3Action, {
    mutationKey: ["update-employee-step3"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      queryClient.invalidateQueries({
        queryKey: ["employee", { id }],
      });
    },
  });

// Step 4: Update Employee (Financial Details)
export const useUpdateEmployeeStep4 = () =>
  useMutation(updateEmployeeStep4Action, {
    mutationKey: ["update-employee-step4"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      queryClient.invalidateQueries({
        queryKey: ["employee", { id }],
      });
    },
  });

// Step 5: Update Employee (Other Details)
export const useUpdateEmployeeStep5 = () =>
  useMutation(updateEmployeeStep5Action, {
    mutationKey: ["update-employee-step5"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      queryClient.invalidateQueries({
        queryKey: ["employee", { id }],
      });
    },
  });

// List Employees
export const useGetEmployees = (input: ListEmployeesParamsInput) =>
  useQuery(listEmployeesAction, {
    queryKey: ["employees", input],
    input,
  });

// Get Employee By ID
export const useGetEmployeeById = (input: GetEmployeeByIdInput) =>
  useQuery(getEmployeeByIdAction, {
    queryKey: ["employee", input.id],
    input,
    enabled: !!input.id,
  });

// Delete Employee
export const useDeleteEmployee = () =>
  useMutation(deleteEmployeeAction, {
    mutationKey: ["delete-employee"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      queryClient.invalidateQueries({
        queryKey: ["employee"],
      });
    },
  });
