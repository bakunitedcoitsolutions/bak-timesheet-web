"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  createProject,
  updateProject,
  findProjectById,
  listProjects,
  deleteProject,
} from "./project.service";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ListProjectsParamsSchema,
  GetProjectByIdSchema,
  DeleteProjectSchema,
  CreateProjectInput,
  UpdateProjectInput,
  GetProjectByIdInput,
  DeleteProjectInput,
} from "./project.schemas";

// Create Project
export const createProjectAction = serverAction
  .input(CreateProjectSchema)
  .handler(async ({ input }: { input: CreateProjectInput }) => {
    const response = await createProject(input);
    return response;
  });

// Update Project
export const updateProjectAction = serverAction
  .input(UpdateProjectSchema)
  .handler(async ({ input }: { input: UpdateProjectInput }) => {
    const { id, ...rest } = input;
    const response = await updateProject(id, rest);
    return response;
  });

// List Projects
export const listProjectsAction = serverAction
  .input(ListProjectsParamsSchema)
  .handler(async ({ input }) => {
    const response = await listProjects(input);
    return response;
  });

// Get Project By ID
export const getProjectByIdAction = serverAction
  .input(GetProjectByIdSchema)
  .handler(async ({ input }: { input: GetProjectByIdInput }) => {
    const response = await findProjectById(input.id);
    return response;
  });

// Delete Project
export const deleteProjectAction = serverAction
  .input(DeleteProjectSchema)
  .handler(async ({ input }: { input: DeleteProjectInput }) => {
    const response = await deleteProject(input.id);
    return response;
  });
