const validateProjectId = (projectId: string | number | null) => {
  if (!projectId) return null;
  if (projectId && isNaN(Number(projectId))) return null;
  return Number(projectId);
};

export { validateProjectId };
