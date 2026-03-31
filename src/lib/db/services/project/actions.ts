"use server";
import { auth } from "@/lib/auth/auth";
import { serverAction } from "@/lib/zsa/zsa-action";
import { USER_ROLES } from "@/utils/user.utility";
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  findProjectById,
} from "./project.service";
import { cache } from "@/lib/redis";
import {
  getGlobalDataAction,
  getSharedProjectsAction,
} from "../shared/actions";
import { CACHE_KEYS } from "../shared/constants";
import {
  DeleteProjectInput,
  CreateProjectSchema,
  UpdateProjectSchema,
  GetProjectByIdInput,
  DeleteProjectSchema,
  GetProjectByIdSchema,
  ListProjectsParamsSchema,
} from "./project.schemas";

// Create Project
export const createProjectAction = serverAction
  .input(CreateProjectSchema)
  .handler(async ({ input }) => {
    const session = await auth();
    const roleId = session?.user?.roleId;
    const userBranchId = session?.user?.branchId;

    if (
      roleId === USER_ROLES.BRANCH_MANAGER ||
      roleId === USER_ROLES.BRANCH_USER
    ) {
      input.branchId = userBranchId as number;
    }

    const response = await createProject(input);
    await cache.delete(CACHE_KEYS.PROJECTS);
    getSharedProjectsAction();
    getGlobalDataAction();
    return response;
  });

// Update Project
export const updateProjectAction = serverAction
  .input(UpdateProjectSchema)
  .handler(async ({ input }) => {
    const session = await auth();
    const roleId = session?.user?.roleId;
    const userBranchId = session?.user?.branchId;

    if (
      roleId === USER_ROLES.BRANCH_MANAGER ||
      roleId === USER_ROLES.BRANCH_USER
    ) {
      input.branchId = userBranchId as number;
    }

    const { id, ...rest } = input;
    const response = await updateProject(id, rest);
    await cache.delete(CACHE_KEYS.PROJECTS);
    getSharedProjectsAction();
    getGlobalDataAction();
    return response;
  });

// List Projects
export const listProjectsAction = serverAction
  .input(ListProjectsParamsSchema)
  .handler(async ({ input }) => {
    const session = await auth();
    const roleId = session?.user?.roleId;
    const userBranchId = session?.user?.branchId;

    const isBranchScoped =
      roleId === USER_ROLES.BRANCH_MANAGER || roleId === USER_ROLES.BRANCH_USER;

    const response = await listProjects({
      ...input,
      branchId: isBranchScoped ? (userBranchId as number) : undefined,
    });
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
