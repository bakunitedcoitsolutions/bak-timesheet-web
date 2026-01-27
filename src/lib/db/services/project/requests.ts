import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import {
  GetProjectByIdInput,
  ListProjectsParamsInput,
} from "./project.schemas";
import {
  listProjectsAction,
  createProjectAction,
  updateProjectAction,
  getProjectByIdAction,
  deleteProjectAction,
} from "./actions";

export const useGetProjects = (input: ListProjectsParamsInput) =>
  useQuery(listProjectsAction, {
    queryKey: ["projects", input],
    input,
  });

export const useCreateProject = () =>
  useMutation(createProjectAction, {
    mutationKey: ["create-project"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });

export const useUpdateProject = () =>
  useMutation(updateProjectAction, {
    mutationKey: ["update-project"],
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", { id }],
      });
    },
  });

export const useGetProjectById = (input: GetProjectByIdInput) =>
  useQuery(getProjectByIdAction, {
    queryKey: ["project", input.id],
    input,
    enabled: !!input.id,
  });

export const useDeleteProject = () =>
  useMutation(deleteProjectAction, {
    mutationKey: ["delete-project"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
