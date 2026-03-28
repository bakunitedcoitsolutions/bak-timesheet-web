import { Button } from "@/components";

interface ProjectHeaderProps {
  isAccessEnabledUser: boolean;
  onNewProject: () => void;
}

export const ProjectHeader = ({
  onNewProject,
  isAccessEnabledUser,
}: ProjectHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
      <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Project Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          View, manage project records, and project details.
        </p>
      </div>
      {!isAccessEnabledUser && (
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="New Project"
            onClick={onNewProject}
          />
        </div>
      )}
    </div>
  );
};
